import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/ui/card";
import { api } from "../lib/api";
import { useTranslation } from "../hooks/useTranslation";
import LanguageSwitcher from "../components/LanguageSwitcher";

export default function Login() {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      // محاولة تسجيل الدخول عبر API
      const response = await api.post("/auth/login", {
        username,
        password,
      });

      if (response.data.token) {
        localStorage.setItem("token", response.data.token);
        navigate("/", { replace: true });
      } else {
        setError("فشل تسجيل الدخول. يرجى التحقق من البيانات.");
      }
    } catch (err: any) {
      console.error("Login error:", err);
      
      // في حالة عدم وجود API حقيقي، نستخدم تسجيل دخول مؤقت
      if (username === "admin" && password === "admin123") {
        localStorage.setItem("token", "demo-token-" + Date.now());
        navigate("/", { replace: true });
      } else {
        setError("اسم المستخدم أو كلمة المرور غير صحيحة");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4" dir="rtl">
      <div className="absolute top-4 left-4">
        <LanguageSwitcher />
      </div>
      <Card className="w-full max-w-md shadow-2xl">
        <CardHeader className="space-y-1 text-center">
          <div className="flex justify-center mb-4">
            <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="w-8 h-8 text-primary"
              >
                <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
                <circle cx="9" cy="7" r="4" />
                <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
                <path d="M16 3.13a4 4 0 0 1 0 7.75" />
              </svg>
            </div>
          </div>
          <CardTitle className="text-2xl font-bold text-primary">{t("app.name")}</CardTitle>
          <CardDescription>{t("app.title")}</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="username">{t("field.name") || "اسم المستخدم"}</Label>
              <Input
                id="username"
                type="text"
                placeholder={t("field.name") || "أدخل اسم المستخدم"}
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
                className="text-right"
                dir="ltr"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">{t("field.password") || "كلمة المرور"}</Label>
              <Input
                id="password"
                type="password"
                placeholder={t("field.password") || "أدخل كلمة المرور"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="text-right"
                dir="ltr"
              />
            </div>

            {error && (
              <div className="bg-destructive/10 text-destructive text-sm p-3 rounded-md text-center">
                {error}
              </div>
            )}

            <Button
              type="submit"
              className="w-full"
              disabled={loading}
            >
              {loading ? t("message.loading") : (t("action.login") || "تسجيل الدخول")}
            </Button>

            <p className="text-xs text-center text-muted-foreground mt-4">
              للتجربة: admin / admin123
            </p>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
