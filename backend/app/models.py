from datetime import datetime
from sqlalchemy import Integer, String, Text, DateTime, ForeignKey
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.database import Base


class User(Base):
    __tablename__ = "users"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    google_sub: Mapped[str] = mapped_column(String(255), unique=True, index=True)
    email: Mapped[str] = mapped_column(String(255), index=True)
    name: Mapped[str | None] = mapped_column(String(255), nullable=True)
    picture: Mapped[str | None] = mapped_column(String(1024), nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)
    updated_at: Mapped[datetime] = mapped_column(
        DateTime, default=datetime.utcnow, onupdate=datetime.utcnow
    )

    records: Mapped[list["MissionRecord"]] = relationship(
        "MissionRecord", back_populates="user", cascade="all, delete-orphan"
    )


class MissionRecord(Base):
    __tablename__ = "mission_records"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    user_id: Mapped[int] = mapped_column(Integer, ForeignKey("users.id"), index=True)

    selected_moon: Mapped[str] = mapped_column(String(50))
    selected_time: Mapped[str] = mapped_column(String(50))
    selected_route: Mapped[str] = mapped_column(String(50))
    reason_text: Mapped[str] = mapped_column(Text)
    reflection_text: Mapped[str] = mapped_column(Text)

    exposure_risk: Mapped[str] = mapped_column(String(20))
    mobility: Mapped[str] = mapped_column(String(20))
    navigation: Mapped[str] = mapped_column(String(20))
    overall: Mapped[str] = mapped_column(String(20))
    feedback_text: Mapped[str] = mapped_column(Text)

    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)

    user: Mapped["User"] = relationship("User", back_populates="records")
