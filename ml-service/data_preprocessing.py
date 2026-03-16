import pandas as pd
import numpy as np
from sklearn.preprocessing import LabelEncoder, StandardScaler
import joblib
import os

def preprocess_sales_data(sales_history):
    """
    Preprocess sales history for demand prediction
    """
    if not sales_history:
        return None
    
    df = pd.DataFrame(sales_history)
    df['date'] = pd.to_datetime(df['date'])
    df['month'] = df['date'].dt.month
    df['day_of_week'] = df['date'].dt.dayofweek
    df['week_of_year'] = df['date'].dt.isocalendar().week
    
    # Aggregate by month
    monthly_sales = df.groupby(df['date'].dt.to_period('M')).agg({
        'quantity': 'sum'
    }).reset_index()
    
    monthly_sales['month_num'] = range(1, len(monthly_sales) + 1)
    
    return monthly_sales

def prepare_recommendation_features(user_data, all_products):
    """
    Prepare features for recommendation system
    """
    # Encode categories
    le_category = LabelEncoder()
    categories = [p['category'] for p in all_products]
    le_category.fit(categories)
    
    # Create user preference vector
    category_preferences = user_data.get('category_preferences', {})
    
    features = []
    for product in all_products:
        # Category match score
        category_score = category_preferences.get(product['category'], 0) / max(category_preferences.values(), default=1)
        
        # Price similarity (based on purchase history)
        avg_price = np.mean([p['price'] for p in user_data.get('purchase_history', [])]) if user_data.get('purchase_history') else product['price']
        price_diff = abs(product['price'] - avg_price) / max(avg_price, 1)
        price_score = 1 / (1 + price_diff)
        
        # Combined features
        features.append({
            'product_id': product['product_id'],
            'category_score': category_score,
            'price_score': price_score,
            'category_encoded': le_category.transform([product['category']])[0],
            'price': product['price']
        })
    
    return pd.DataFrame(features), le_category

def prepare_demand_features(product_data, sales_history):
    """
    Prepare features for demand prediction
    """
    features = []
    targets = []
    
    # Sales history features
    if sales_history and len(sales_history) > 0:
        df = pd.DataFrame(sales_history)
        df['date'] = pd.to_datetime(df['date'])
        df['month'] = df['date'].dt.month
        df['quarter'] = df['date'].dt.quarter
        
        # Create lag features
        for lag in [1, 2, 3]:
            df[f'lag_{lag}'] = df['quantity'].shift(lag)
        
        # Rolling statistics
        df['rolling_mean_3'] = df['quantity'].rolling(window=3, min_periods=1).mean()
        df['rolling_std_3'] = df['quantity'].rolling(window=3, min_periods=1).std()
        
        # Drop NaN values
        df = df.dropna()
        
        if len(df) > 0:
            # Product features
            df['price'] = product_data['price']
            df['category_encoded'] = LabelEncoder().fit_transform([product_data['category']])[0]
            
            # Select features
            feature_columns = ['month', 'quarter', 'lag_1', 'lag_2', 'lag_3', 
                             'rolling_mean_3', 'rolling_std_3', 'price', 'category_encoded']
            
            features = df[feature_columns].values
            targets = df['quantity'].values
    
    return features, targets