"""
MediCore AI Analytics Engine: Demand Forecasting Trainer
Model: Ridge Regression / Random Forest with Seasonal Weekly Encodings
"""

import numpy as np
import pandas as pd
from sklearn.linear_model import Ridge
from sklearn.metrics import mean_absolute_error, r2_score
import joblib
import os

def generate_synthetic_data(num_days=365):
    """Generate realistic daily hospital appointment demand records."""
    np.random.seed(42)
    dates = pd.date_range(start='2025-01-01', periods=num_days, freq='D')
    
    # Weekly seasonality
    day_effects = {0: 15, 1: 12, 2: 8, 3: 5, 4: 10, 5: -18, 6: -22}
    
    # Trend growth (slow hospital growth over the year)
    trend = np.linspace(0, 8, num_days)
    
    # Baseline noise
    noise = np.random.normal(0, 3.5, num_days)
    
    daily_volume = [
        max(10, int(35 + trend[i] + day_effects[dates[i].dayofweek] + noise[i]))
        for i in range(num_days)
    ]
    
    df = pd.DataFrame({
        'date': dates,
        'day_of_week': dates.dayofweek,
        'is_weekend': dates.dayofweek.isin([5, 6]).astype(int),
        'month': dates.month,
        'day_of_year': dates.dayofyear,
        'appointment_volume': daily_volume
    })
    return df

def train_demand_model():
    print("🤖 Generating historical hospital dataset...")
    df = generate_synthetic_data(365)
    
    features = ['day_of_week', 'is_weekend', 'month', 'day_of_year']
    X = df[features]
    y = df['appointment_volume']
    
    # Split train and test sets (last 60 days for evaluation)
    X_train, X_test = X[:-60], X[-60:]
    y_train, y_test = y[:-60], y[-60:]
    
    print("📈 Training Ridge Regression Model...")
    model = Ridge(alpha=1.0)
    model.fit(X_train, y_train)
    
    preds = model.predict(X_test)
    mae = mean_absolute_error(y_test, preds)
    r2 = r2_score(y_test, preds)
    
    print(f"✅ Model Training Complete!")
    print(f"📊 Validation Mean Absolute Error (MAE): {mae:.2f} appointments")
    print(f"📊 Validation R² Variance Explained: {r2:.3f}")
    
    os.makedirs('../models', exist_ok=True)
    joblib.dump(model, '../models/demand_model.pkl')
    print("💾 Model serialized to 'models/demand_model.pkl'")

if __name__ == '__main__':
    train_demand_model()
