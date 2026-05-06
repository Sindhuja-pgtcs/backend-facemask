import joblib
import numpy as np
from sklearn.ensemble import RandomForestClassifier
from sklearn.model_selection import train_test_split
from sklearn.metrics import accuracy_score

def train_mask_detector():
    """
    Simulates loading a face mask dataset and trains a scikit-learn model.
    In a real scenario, this would use pre-processed image features (e.g., HOG or Haar).
    """
    print("Initializing dataset creation...")
    
    # Simulate a small dataset: 200 samples, 100 features (e.g. flattened 10x10 gray images)
    # Class 0: No Mask, Class 1: Wearing Mask
    np.random.seed(42)
    X = np.random.rand(200, 100)
    y = np.random.randint(0, 2, 200)

    # Split dataset into training and testing sets
    X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)

    # Use a Random Forest Classifier - robust and easy to train with scikit-learn
    print("Training Random Forest model...")
    model = RandomForestClassifier(n_estimators=100, random_state=42)
    model.fit(X_train, y_train)

    # Evaluate the model
    y_pred = model.predict(X_test)
    accuracy = accuracy_score(y_test, y_pred)
    
    print(f"Model Training Complete. Accuracy: {accuracy * 100:.2f}%")

    # Save the trained model to a file
    model_filename = 'model.pkl'
    joblib.dump(model, model_filename)
    print(f"Model saved successfully to {model_filename}")

if __name__ == "__main__":
    train_mask_detector()
