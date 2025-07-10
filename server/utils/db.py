
from flask_pymongo import PyMongo

mongo = PyMongo()

def init_mongo(app):
    app.config["MONGO_URI"] = "mongodb://localhost:27017/livestream_overlay_db?serverSelectionTimeoutMS=2000&connectTimeoutMS=2000&socketTimeoutMS=2000"
    try:
        mongo.init_app(app)
        with app.app_context():
            # Test the connection by accessing the database
            mongo.db.list_collection_names()
            print("MongoDB initialized and connected.")
    except Exception as e:
        print(f"MongoDB connection failed: {e}")
        raise e
