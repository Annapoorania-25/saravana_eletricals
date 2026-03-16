import pandas as pd
import numpy as np
from lightgbm import LGBMRegressor, LGBMClassifier
from sklearn.model_selection import train_test_split
from sklearn.metrics import mean_squared_error, accuracy_score
import joblib
import os
from datetime import datetime, timedelta

# Generate synthetic training data for demand prediction
def generate_synthetic_sales_data(n_products=50, n_months=24):
    """
    Generate synthetic sales data for training
    """
    np.random.seed(42)
    
    data = []
    categories = ['Tools', 'Electrical', 'Plumbing', 'Paint', 'Hardware', 'Garden', 'Lumber']
    
    for product_id in range(1, n_products + 1):
        category = np.random.choice(categories)
        base_price = np.random.uniform(5, 200)
        base_demand = np.random.randint(10, 100)
        seasonality = np.random.choice([0.5, 1, 1.5, 2, 1.2, 0.8])  # Monthly factors
        
        for month in range(1, n_months + 1):
            # Add trend
            trend = 1 + (month / n_months) * np.random.uniform(-0.2, 0.3)
            
            # Add seasonality
            seasonal_factor = 1 + np.sin(month * np.pi / 6) * 0.3
            
            # Add noise
            noise = np.random.normal(1, 0.1)
            
            demand = base_demand * trend * seasonal_factor * noise
            demand = max(0, int(demand))
            
            # Add promotion effect (random promotions)
            promotion = np.random.choice([0, 1], p=[0.8, 0.2])
            if promotion:
                demand *= 1.5
            
            data.append({
                'product_id': f'P{product_id:03d}',
                'category': category,
                'price': base_price * (0.9 if promotion else 1),
                'month': month,
                'quarter': (month - 1) // 3 + 1,
                'year': 2023 + (month // 12),
                'promotion': promotion,
                'demand': int(demand)
            })
    
    return pd.DataFrame(data)

# Generate synthetic data for recommendations
def generate_recommendation_data(n_users=100, n_products=50):
    """
    Generate synthetic user-product interaction data
    """
    np.random.seed(43)
    
    data = []
    products = pd.read_csv('products.csv')
    
    for user_id in range(1, n_users + 1):
        # User preferences
        preferred_categories = np.random.choice(products['category'].unique(), 
                                              size=np.random.randint(1, 4), 
                                              replace=False)
        
        # Generate purchase history
        n_purchases = np.random.randint(1, 20)
        purchased_products = np.random.choice(products['product_id'], 
                                            size=n_purchases, 
                                            replace=True)
        
        for product_id in purchased_products:
            product = products[products['product_id'] == product_id].iloc[0]
            
            # Rating based on user preferences
            if product['category'] in preferred_categories:
                rating = np.random.uniform(3, 5)
            else:
                rating = np.random.uniform(1, 3.5)
            
            data.append({
                'user_id': user_id,
                'product_id': product_id,
                'category': product['category'],
                'price': product['price'],
                'rating': rating,
                'purchased': 1,
                'viewed': np.random.choice([0, 1], p=[0.3, 0.7])
            })
    
    return pd.DataFrame(data)

def train_demand_prediction_model():
    """
    Train LightGBM model for demand prediction
    """
    print("Generating synthetic sales data...")
    sales_data = generate_synthetic_sales_data()
    
    # Prepare features
    feature_columns = ['month', 'quarter', 'price', 'promotion']
    
    # Encode categorical features
    category_dummies = pd.get_dummies(sales_data['category'], prefix='cat')
    X = pd.concat([sales_data[feature_columns], category_dummies], axis=1)
    y = sales_data['demand']
    
    # Split data
    X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)
    
    # Train model
    print("Training demand prediction model...")
    model = LGBMRegressor(
        n_estimators=100,
        learning_rate=0.1,
        max_depth=5,
        random_state=42,
        verbose=0
    )
    
    model.fit(X_train, y_train)
    
    # Evaluate
    y_pred = model.predict(X_test)
    mse = mean_squared_error(y_test, y_pred)
    rmse = np.sqrt(mse)
    print(f"Model RMSE: {rmse:.2f}")
    
    # Save model
    joblib.dump(model, 'demand_model.pkl')
    print("Demand prediction model saved as demand_model.pkl")
    
    # Save feature names for inference
    feature_names = X.columns.tolist()
    joblib.dump(feature_names, 'demand_features.pkl')
    
    return model

def train_recommendation_model():
    """
    Train LightGBM model for product recommendations
    """
    print("Generating synthetic recommendation data...")
    rec_data = generate_recommendation_data()
    
    # Prepare features
    feature_columns = ['price']
    
    # Encode categorical features
    category_dummies = pd.get_dummies(rec_data['category'], prefix='cat')
    
    # User and product ID encoding (simplified for demo)
    user_encoder = {uid: i for i, uid in enumerate(rec_data['user_id'].unique())}
    product_encoder = {pid: i for i, pid in enumerate(rec_data['product_id'].unique())}
    
    rec_data['user_encoded'] = rec_data['user_id'].map(user_encoder)
    rec_data['product_encoded'] = rec_data['product_id'].map(product_encoder)
    
    # Prepare features
    X = pd.concat([
        rec_data[['user_encoded', 'product_encoded', 'price']],
        category_dummies
    ], axis=1)
    
    y = rec_data['rating']  # Target: rating/purchase likelihood
    
    # Split data
    X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)
    
    # Train model
    print("Training recommendation model...")
    model = LGBMRegressor(
        n_estimators=100,
        learning_rate=0.1,
        max_depth=6,
        random_state=42,
        verbose=0
    )
    
    model.fit(X_train, y_train)
    
    # Evaluate
    y_pred = model.predict(X_test)
    mse = mean_squared_error(y_test, y_pred)
    rmse = np.sqrt(mse)
    print(f"Recommendation Model RMSE: {rmse:.2f}")
    
    # Save model and encoders
    joblib.dump(model, 'recommendation_model.pkl')
    joblib.dump(user_encoder, 'user_encoder.pkl')
    joblib.dump(product_encoder, 'product_encoder.pkl')
    print("Recommendation model saved as recommendation_model.pkl")
    
    return model

if __name__ == "__main__":
    print("=" * 50)
    print("Training ML Models for Smart Hardware Store")
    print("=" * 50)
    
    # Train demand prediction model
    print("\n1. Training Demand Prediction Model")
    print("-" * 30)
    demand_model = train_demand_prediction_model()
    
    # Train recommendation model
    print("\n2. Training Recommendation Model")
    print("-" * 30)
    rec_model = train_recommendation_model()
    
    print("\n" + "=" * 50)
    print("Training completed successfully!")
    print("Models saved:")
    print("  - demand_model.pkl")
    print("  - demand_features.pkl")
    print("  - recommendation_model.pkl")
    print("  - user_encoder.pkl")
    print("  - product_encoder.pkl")
    print("=" * 50)