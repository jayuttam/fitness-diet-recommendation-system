import pandas as pd
import random
import math

data = []

genders = ["Male", "Female"]
activities = ["Sedentary", "Moderate", "Active"]
goals = ["Fat Loss", "Muscle Gain", "Maintain"]

for _ in range(2000):   # 2000 rows
    age = random.randint(18, 50)
    height = random.randint(150, 190)
    weight = random.randint(45, 110)
    gender = random.choice(genders)
    activity = random.choice(activities)
    goal = random.choice(goals)

    height_m = height / 100
    bmi = round(weight / (height_m ** 2), 2)

    # BMR calculation
    if gender == "Male":
        bmr = 10 * weight + 6.25 * height - 5 * age + 5
    else:
        bmr = 10 * weight + 6.25 * height - 5 * age - 161

    activity_factor = {
        "Sedentary": 1.2,
        "Moderate": 1.55,
        "Active": 1.9
    }[activity]

    calories = bmr * activity_factor

    if goal == "Fat Loss":
        calories -= 500
    elif goal == "Muscle Gain":
        calories += 300

    calories = int(calories)

    # Diet label
    if goal == "Muscle Gain":
        diet = "High Protein"
    elif goal == "Fat Loss":
        diet = "Low Carb"
    else:
        diet = "Balanced"

    # Workout label
    if bmi > 25 and goal == "Fat Loss":
        workout = "Intense"
    elif bmi < 18:
        workout = "Light"
    else:
        workout = "Moderate"

    data.append([
        age, height, weight, gender, activity, goal,
        bmi, calories, diet, workout
    ])

df = pd.DataFrame(data, columns=[
    "age", "height_cm", "weight_kg", "gender",
    "activity_level", "goal", "bmi",
    "calories", "diet_type", "workout_type"
])

df.to_csv("fitness_dataset.csv", index=False)
print("Dataset generated successfully!")
