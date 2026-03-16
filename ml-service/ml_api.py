from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Optional, Dict, Any
import pandas as pd
import numpy as np
import joblib
import uvicorn
from datetime import datetime, timedelta
import os

# Initialize FastAPI
app = FastAPI(title="Hardware Store ML Service")

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Load models (with error handling)
try:
    demand_model = joblib.load('demand_model.pkl')
    demand_features = joblib.load('demand_features.pkl')
    rec_model = joblib.load('recommendation_model.pkl')
    user_encoder = joblib.load('user_encoder.pkl')
    product_encoder = joblib.load('product_encoder.pkl')
    print("Models loaded successfully")
except FileNotFoundError as e:
    print(f"Warning: Model files not found. Please run train_model.py first.")
    print(f"Error: {e}")
    demand_model = None
    demand_features = None
    rec_model = None
    user_encoder = None
    product_encoder = None

# Load product catalog
try:
    products_df = pd.read_csv('products.csv')
    print(f"Loaded {len(products_df)} products")
except FileNotFoundError:
    print("Warning: products.csv not found. Creating empty DataFrame.")
    products_df = pd.DataFrame(columns=['product_id', 'name', 'category', 'price', 'brand', 'description'])

# Pydantic models
class PurchaseHistory(BaseModel):
    productId: str
    category: str
    price: float
    quantity: int
    date: Optional[str] = None

class RecommendationRequest(BaseModel):
    user_id: str
    purchase_history: List[Dict[str, Any]]
    category_preferences: Dict[str, int]
    all_products: List[Dict[str, Any]]

class DemandPredictionRequest(BaseModel):
    product_id: str
    category: str
    price: float
    current_stock: int
    sales_history: List[Dict[str, Any]]
    months_to_predict: int = 3

class Product(BaseModel):
    product_id: str
    name: str
    category: str
    price: float
    brand: str
    description: str

# Helper functions
def get_similar_products(product_id: str, n_recommendations: int = 5):
    """
    Get similar products based on category and price
    """
    if product_id not in products_df['product_id'].values:
        return []
    
    product = products_df[products_df['product_id'] == product_id].iloc[0]
    
    # Find products in same category
    same_category = products_df[products_df['category'] == product['category']]
    same_category = same_category[same_category['product_id'] != product_id]
    
    if len(same_category) >= n_recommendations:
        return same_category.sample(n=n_recommendations)['product_id'].tolist()
    else:
        # Add products from other categories with similar price
        price_range = product['price'] * 0.3
        similar_price = products_df[
            (products_df['price'].between(product['price'] - price_range, 
                                         product['price'] + price_range)) &
            (products_df['product_id'] != product_id)
        ]
        
        recommendations = same_category['product_id'].tolist()
        remaining = n_recommendations - len(recommendations)
        
        if remaining > 0 and len(similar_price) > 0:
            other_recs = similar_price.sample(n=min(remaining, len(similar_price)))['product_id'].tolist()
            recommendations.extend(other_recs)
        
        return recommendations

def predict_demand_fallback(product_data, sales_history, months=3):
    """
    Fallback demand prediction using simple moving average
    """
    if not sales_history:
        # No history: use category average or default
        category_avg = products_df[products_df['category'] == product_data['category']].shape[0] * 5
        return [max(10, int(category_avg))] * months
    
    # Calculate moving average
    quantities = [sale.get('quantity', 0) for sale in sales_history[-6:]]  # Last 6 months
    if len(quantities) < 2:
        avg = np.mean([10, 20])  # Default
    else:
        avg = np.mean(quantities)
    
    # Add simple trend
    predictions = []
    for i in range(months):
        # Simple seasonal adjustment
        seasonal_factor = 1 + np.sin((datetime.now().month + i) * np.pi / 6) * 0.2
        predicted = int(avg * seasonal_factor * (1 + i * 0.05))  # Small trend
        predictions.append(max(5, predicted))
    
    return predictions

# API Endpoints
@app.get("/")
async def root():
    return {
        "message": "Hardware Store ML Service",
        "status": "running",
        "models_loaded": {
            "demand_model": demand_model is not None,
            "recommendation_model": rec_model is not None
        }
    }

@app.get("/health")
async def health_check():
    return {"status": "healthy"}

@app.post("/recommend")
async def get_recommendations(request: RecommendationRequest):
    """
    Get product recommendations based on user history
    """
    try:
        # If no purchase history, return popular products
        if not request.purchase_history:
            popular = products_df.sample(n=min(10, len(products_df)))
            recommendations = [
                {
                    "product_id": row['product_id'],
                    "name": row['name'],
                    "category": row['category'],
                    "price": row['price'],
                    "score": 1.0
                }
                for _, row in popular.iterrows()
            ]
            return {
                "recommendations": recommendations,
                "explanation": "Based on popular products"
            }
        
        # Extract user preferences
        categories = list(request.category_preferences.keys())
        
        if categories:
            # Filter by preferred categories
            preferred_products = products_df[products_df['category'].isin(categories)]
            
            # Score based on price similarity
            avg_price = np.mean([p['price'] for p in request.purchase_history])
            
            def calculate_score(row):
                category_score = request.category_preferences.get(row['category'], 0) / max(request.category_preferences.values())
                price_diff = abs(row['price'] - avg_price) / max(avg_price, 1)
                price_score = 1 / (1 + price_diff)
                return (category_score * 0.6 + price_score * 0.4)
            
            preferred_products['score'] = preferred_products.apply(calculate_score, axis=1)
            
            # Get top recommendations
            top_recs = preferred_products.nlargest(10, 'score')
            
            recommendations = [
                {
                    "product_id": row['product_id'],
                    "name": row['name'],
                    "category": row['category'],
                    "price": row['price'],
                    "score": row['score']
                }
                for _, row in top_recs.iterrows()
            ]
            
            return {
                "recommendations": recommendations,
                "explanation": "Based on your category preferences and price range"
            }
        else:
            # Fallback: similar to last purchased products
            last_purchases = request.purchase_history[-3:]
            all_recs = []
            
            for purchase in last_purchases:
                similar = get_similar_products(purchase['productId'], 3)
                all_recs.extend(similar)
            
            # Remove duplicates and limit
            unique_recs = list(dict.fromkeys(all_recs))[:10]
            
            rec_products = products_df[products_df['product_id'].isin(unique_recs)]
            recommendations = [
                {
                    "product_id": row['product_id'],
                    "name": row['name'],
                    "category": row['category'],
                    "price": row['price'],
                    "score": 1.0
                }
                for _, row in rec_products.iterrows()
            ]
            
            return {
                "recommendations": recommendations,
                "explanation": "Similar to products you've purchased before"
            }
            
    except Exception as e:
        print(f"Recommendation error: {str(e)}")
        # Fallback: random products
        random_products = products_df.sample(n=min(10, len(products_df)))
        recommendations = [
            {
                "product_id": row['product_id'],
                "name": row['name'],
                "category": row['category'],
                "price": row['price'],
                "score": 1.0
            }
            for _, row in random_products.iterrows()
        ]
        return {
            "recommendations": recommendations,
            "explanation": "Popular products"
        }

@app.post("/predict-demand")
async def predict_demand(request: DemandPredictionRequest):
    """
    Predict demand for a product
    """
    try:
        predictions = predict_demand_fallback(
            {
                'category': request.category,
                'price': request.price
            },
            request.sales_history,
            request.months_to_predict
        )
        
        # Add confidence intervals
        confidence_intervals = []
        for pred in predictions:
            lower = int(pred * 0.8)
            upper = int(pred * 1.2)
            confidence_intervals.append({"lower": lower, "upper": upper})
        
        months = []
        current_date = datetime.now()
        for i in range(request.months_to_predict):
            month_date = current_date + timedelta(days=30 * i)
            months.append(month_date.strftime("%Y-%m"))
        
        return {
            "product_id": request.product_id,
            "predictions": [
                {
                    "month": months[i],
                    "predicted_demand": predictions[i],
                    "confidence_interval": confidence_intervals[i]
                }
                for i in range(len(predictions))
            ],
            "current_stock": request.current_stock,
            "recommended_reorder": max(predictions) > request.current_stock * 0.7
        }
        
    except Exception as e:
        print(f"Demand prediction error: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/products")
async def get_products():
    """
    Get all products
    """
    products = products_df.to_dict('records')
    return {"products": products}

@app.get("/products/{product_id}")
async def get_product(product_id: str):
    """
    Get product by ID
    """
    product = products_df[products_df['product_id'] == product_id]
    if len(product) == 0:
        raise HTTPException(status_code=404, detail="Product not found")
    
    return product.iloc[0].to_dict()

@app.get("/products/category/{category}")
async def get_products_by_category(category: str):
    """
    Get products by category
    """
    products = products_df[products_df['category'].str.lower() == category.lower()]
    return {"products": products.to_dict('records')}

@app.get("/similar/{product_id}")
async def get_similar(product_id: str, n: int = 5):
    """
    Get similar products
    """
    similar_ids = get_similar_products(product_id, n)
    similar_products = products_df[products_df['product_id'].isin(similar_ids)]
    
    return {
        "product_id": product_id,
        "similar_products": similar_products.to_dict('records')
    }

@app.get("/categories")
async def get_categories():
    """
    Get all categories
    """
    categories = products_df['category'].unique().tolist()
    return {"categories": categories}

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000, reload=True)