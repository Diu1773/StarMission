from datetime import datetime
from pydantic import BaseModel


class GoogleLoginRequest(BaseModel):
    credential: str


class UserOut(BaseModel):
    id: int
    email: str
    name: str | None
    picture: str | None

    model_config = {"from_attributes": True}


class RecordCreate(BaseModel):
    selectedMoon: str
    selectedTime: str
    selectedRoute: str
    reasonText: str
    reflectionText: str


class RecordOut(BaseModel):
    id: int
    selected_moon: str
    selected_time: str
    selected_route: str
    reason_text: str
    reflection_text: str
    exposure_risk: str
    mobility: str
    navigation: str
    overall: str
    feedback_text: str
    created_at: datetime

    model_config = {"from_attributes": True}


class RecordListItem(BaseModel):
    id: int
    selected_moon: str
    selected_time: str
    selected_route: str
    overall: str
    created_at: datetime

    model_config = {"from_attributes": True}
