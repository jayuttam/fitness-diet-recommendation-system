import pandas as pd
import numpy as np
from sklearn.model_selection import train_test_split
from sklearn.linear_model import LinearRegression
import joblib

# encode dataset loading
df = pd.read_csv(r"C:\Users\Jay Uttam\Downloads\MERN_Project\ml_service\data\encoded_fitness_dataset.csv")
print(df.head(5))

# data sepration into inputs(X) and outputs(Y)
X = df[["age", "height_cm", "weight_kg",
    "gender", "activity_level", "goal", "bmi"]]

Y = df["calories"]

# train test split
X_train, X_test, Y_train, Y_test = train_test_split(X, Y, test_size=0.2, random_state=42)

# model training
model = LinearRegression()
model.fit(X_train, Y_train)

joblib.dump(model, "../models/calorie_model.pkl")
print("Calories model trained & saved.")

