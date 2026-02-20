import pandas as pd
import numpy as np
from sklearn.preprocessing import LabelEncoder
import joblib

df = pd.read_csv(r"C:\Users\Jay Uttam\Downloads\MERN_Project\ml_service\Datset\fitness_dataset.csv")


encoders = {} # dictionary to hold label encoders
for col in ["gender", "activity_level", "goal", "diet_type", "workout_type"]:
    le = LabelEncoder()
    df[col] = le.fit_transform(df[col])
    encoders[col] = le

joblib.dump(encoders, "../encoders.pkl")
df.to_csv("../data/encoded_fitness_dataset.csv", index=False)

print("Encoding done and saved.")
