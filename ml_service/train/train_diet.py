import pandas as pd
import numpy as np
import joblib
from sklearn.model_selection import train_test_split
from sklearn.tree import DecisionTreeClassifier

df = pd.read_csv(r"C:\Users\Jay Uttam\Downloads\MERN_Project\ml_service\data\encoded_fitness_dataset.csv")
print(df.head(5))

# data splitting into X(features) and Y(output)
X = df[["age", "height_cm", "weight_kg",
    "gender", "activity_level", "goal", "bmi"]]
Y = df['diet_type']

# train test split
X_train, X_test, Y_train, Y_test = train_test_split(X, Y, test_size=0.2, random_state=42)

# model training
model = DecisionTreeClassifier(max_depth=5)
model.fit(X_train, Y_train)

# model saved
joblib.dump(model, "../models/diet_model.pkl")
print("Diet model trained & saved.")