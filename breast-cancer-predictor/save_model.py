import pandas as pd
from sklearn.linear_model import LogisticRegression
from sklearn.model_selection import train_test_split
import joblib

# Load the dataset
dataset = pd.read_csv("breast_cancer.csv")  # Ensure the CSV is in the same folder
X = dataset.iloc[:, 1:-1].values
y = dataset.iloc[:, -1].values

# Train/test split
X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=0)

# Train logistic regression model
model = LogisticRegression(random_state=0)
model.fit(X_train, y_train)

# Save the model to a .pkl file
joblib.dump(model, "model.pkl")
print("Model saved as model.pkl")
