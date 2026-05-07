from fastapi import APIRouter, Depends, Response
from sqlalchemy.orm import Session
from app.database import get_db
from app.models import User
from app.schemas import GoogleLoginRequest, UserOut
from app.auth import verify_google_token, create_jwt, get_current_user_id
from app.config import settings

router = APIRouter()


@router.post("/google")
def google_login(body: GoogleLoginRequest, response: Response, db: Session = Depends(get_db)):
    idinfo = verify_google_token(body.credential)

    google_sub = idinfo["sub"]
    email = idinfo.get("email", "")
    name = idinfo.get("name")
    picture = idinfo.get("picture")

    user = db.query(User).filter(User.google_sub == google_sub).first()
    if user:
        user.email = email
        user.name = name
        user.picture = picture
    else:
        user = User(google_sub=google_sub, email=email, name=name, picture=picture)
        db.add(user)

    db.commit()
    db.refresh(user)

    token = create_jwt(user.id, user.email)
    response.set_cookie(
        key="access_token",
        value=token,
        httponly=True,
        secure=settings.COOKIE_SECURE,
        samesite=settings.COOKIE_SAMESITE,
        max_age=60 * 60 * 24 * 7,
    )
    return {"ok": True, "user": UserOut.model_validate(user)}


@router.get("/me", response_model=UserOut)
def get_me(
    user_id: int = Depends(get_current_user_id),
    db: Session = Depends(get_db),
):
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        from fastapi import HTTPException, status
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="사용자를 찾을 수 없습니다.")
    return user


@router.post("/logout")
def logout(response: Response):
    response.delete_cookie(key="access_token")
    return {"ok": True}
