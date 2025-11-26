import axios from "axios";

// 세션/쿠키 자동 포함
axios.defaults.withCredentials = true;

// 모든 응답 가로채기
axios.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error.response?.status;
    const isLoginPage = window.location.pathname === "/login";

    if (status === 401 && !isLoginPage) {
      console.warn("세션 만료 → 자동 로그아웃");

      localStorage.removeItem("user");

      window.location.href = "/login";
    }

    return Promise.reject(error);
  }
);


export default axios;
