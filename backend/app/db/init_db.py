from app.db.session import engine
from app.db.base_class import Base
# Import all models here so that Base.metadata.create_all() works
from app.models.subscription import Subscription, Filter, DownloadHistory

def init_db():
    Base.metadata.create_all(bind=engine)
