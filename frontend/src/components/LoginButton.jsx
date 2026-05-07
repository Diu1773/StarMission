import { GoogleLogin } from "@react-oauth/google";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";

export default function LoginButton({ onSuccess }) {
  const { loginWithGoogle } = useAuth();
  const navigate = useNavigate();

  const handleSuccess = async (credentialResponse) => {
    try {
      await loginWithGoogle(credentialResponse.credential);
      if (onSuccess) onSuccess();
      else navigate("/mission");
    } catch (err) {
      alert(`로그인 실패: ${err.message}`);
    }
  };

  return (
    <GoogleLogin
      onSuccess={handleSuccess}
      onError={() => alert("Google 로그인에 실패했습니다.")}
      useOneTap={false}
      theme="filled_black"
      text="signin_with"
      locale="ko"
    />
  );
}
