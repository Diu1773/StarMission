from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.database import get_db
from app.models import MissionRecord
from app.schemas import RecordCreate, RecordOut, RecordListItem
from app.auth import get_current_user_id
from app.scoring import calculate_score

router = APIRouter()


@router.post("", response_model=RecordOut)
def create_record(
    body: RecordCreate,
    user_id: int = Depends(get_current_user_id),
    db: Session = Depends(get_db),
):
    result = calculate_score(
        body.selectedMoon, body.selectedTime, body.selectedRoute,
        reason_text=body.reasonText or "",
        reflection_text=body.reflectionText or "",
    )

    record = MissionRecord(
        user_id=user_id,
        selected_moon=body.selectedMoon,
        selected_time=body.selectedTime,
        selected_route=body.selectedRoute,
        reason_text=body.reasonText,
        reflection_text=body.reflectionText,
        exposure_risk=result["exposure_risk"],
        mobility=result["mobility"],
        navigation=result["navigation"],
        overall=result["overall"],
        feedback_text=result["feedback_text"],
    )
    db.add(record)
    db.commit()
    db.refresh(record)
    return record


@router.get("", response_model=list[RecordListItem])
def list_records(
    user_id: int = Depends(get_current_user_id),
    db: Session = Depends(get_db),
):
    return (
        db.query(MissionRecord)
        .filter(MissionRecord.user_id == user_id)
        .order_by(MissionRecord.created_at.desc())
        .all()
    )


@router.get("/{record_id}", response_model=RecordOut)
def get_record(
    record_id: int,
    user_id: int = Depends(get_current_user_id),
    db: Session = Depends(get_db),
):
    record = db.query(MissionRecord).filter(MissionRecord.id == record_id).first()
    if not record:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="기록을 찾을 수 없습니다.")
    if record.user_id != user_id:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="접근 권한이 없습니다.")
    return record
