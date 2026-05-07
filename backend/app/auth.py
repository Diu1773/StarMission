from datetime import datetime, timedelta
from fastapi import Cookie, HTTPException, status
from jose import JWTError, jwt
from google.oauth2 import id_token
from google.auth.transport import requests as google_requests
import httpx
from app.config import settings

JWT_ALGORITHM = "HS256"
JWT_EXPIRE_HOURS = 24 * 7


def verify_google_token(credential: str) -> dict:
    """id_token(credential) 검증"""
    if not settings.GOOGLE_CLIENT_ID:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="Google Client ID가 설정되지 않았습니다.",
        )
    try:
        idinfo = id_token.verify_oauth2_token(
            credential,
            google_requests.Request(),
            settings.GOOGLE_CLIENT_ID,
        )
        return idinfo
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail=f"Google 토큰 검증 실패: {str(e)}",
        )


def verify_google_access_token(access_token: str) -> dict:
    """access_token으로 userinfo 조회"""
    resp = httpx.get(
        "https://www.googleapis.com/oauth2/v3/userinfo",
        headers={"Authorization": f"Bearer {access_token}"},
    )
    if resp.status_code != 200:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Google access_token 검증 실패",
        )
    data = resp.json()
    # userinfo 응답을 idinfo 형식에 맞춤
    data["sub"] = data.get("sub", "")
    return data


def create_jwt(user_id: int, email: str) -> str:
    expire = datetime.utcnow() + timedelta(hours=JWT_EXPIRE_HOURS)
    payload = {"sub": str(user_id), "email": email, "exp": expire}
    return jwt.encode(payload, settings.JWT_SECRET_KEY, algorithm=JWT_ALGORITHM)


def decode_jwt(token: str) -> dict:
    try:
        return jwt.decode(token, settings.JWT_SECRET_KEY, algorithms=[JWT_ALGORITHM])
    except JWTError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="인증이 필요합니다.",
        )


def get_current_user_id(access_token: str | None = Cookie(default=None)) -> int:
    if not access_token:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="로그인이 필요합니다.",
        )
    payload = decode_jwt(access_token)
    return int(payload["sub"])
