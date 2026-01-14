import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "../../components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "../../components/ui/card";
import { Input } from "../../components/ui/input";
import { Label } from "../../components/ui/label";
import { AlertCircle, Lock, User } from "lucide-react";
import logo from "../../assets/logo.svg";

const API_BASE_URL = (import.meta.env.VITE_API_URL?.replace(/\/$/, "")) || "/api";

type LoginResponse = {
  success: boolean;
  token: string;
  user: {
    id: string;
    username: string;
    email?: string;
    fullName?: string;
    role: string;
    employeeId?: string;
  };
  message?: string;
};

export default function Login() {
  const navigate = useNavigate();
  const [username, setUsername] = useState("admin");
  const [password, setPassword] = useState("admin123");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    setError("");
    setLoading(true);

    try {
      const res = await fetch(`${API_BASE_URL}/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });

      const data = (await res.json().catch(() => null)) as LoginResponse | null;
      if (!res.ok || !data?.success) throw new Error(data?.message || "فشل تسجيل الدخول");

      localStorage.setItem("token", data.token);
      localStorage.setItem("authToken", data.token);
      localStorage.setItem("role", data.user.role);
      localStorage.setItem("user", JSON.stringify(data.user));

      navigate("/admin");
    } catch (e: any) {
      setError(e?.message || "فشل تسجيل الدخول");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div dir="rtl" className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden" style={{ background: "linear-gradient(135deg, #d8b4f3 0%, #e9d5ff 100%)" }}>
      {/* Decorative elements */}
      <div className="absolute top-10 right-10 w-40 h-40 rounded-full opacity-10" style={{ background: "radial-gradient(circle, #7e22ce, transparent)" }}></div>
      <div className="absolute bottom-10 left-10 w-52 h-52 rounded-full opacity-10" style={{ background: "radial-gradient(circle, #7e22ce, transparent)" }}></div>

      {/* Main Container */}
      <div className="relative z-10 w-full max-w-6xl flex flex-col md:flex-row items-center justify-center gap-8 lg:gap-12">
        {/* Image Section - Right side (RTL) */}
        <div className="w-full md:w-1/2 flex flex-col items-center justify-center gap-6 order-1 md:order-2">
          {/* Platform Name Frame */}
          <div className="border-4 border-black rounded-2xl px-8 py-4 bg-white/80 backdrop-blur-sm shadow-lg">
            <p className="text-center font-extrabold text-black text-lg md:text-xl whitespace-nowrap">
              منصة إدارة التأمين الإلزامي
            </p>
          </div>

          {/* Image */}
          <img
            src="https://cdn.builder.io/api/v1/image/assets%2Fb6b16a9014c841e88304118b32cab328%2Fee4008a4694446bfa030c6eda37fc9a8?format=webp&width=800"
            alt="Insurance Protection"
            className="w-full max-w-md rounded-2xl shadow-2xl border-4 border-white/50 backdrop-blur-sm hover:shadow-3xl transition-shadow duration-300"
          />
        </div>

        {/* Login Card Section - Left side (RTL) */}
        <div className="w-full md:w-1/2 flex items-center justify-center order-2 md:order-1">
          <Card className="overflow-hidden bg-white/95 backdrop-blur-md shadow-2xl border-2 border-violet-600 rounded-3xl w-full max-w-sm">
            {/* Header gradient bar */}
            <div className="h-1.5 w-full" style={{ background: "linear-gradient(90deg, #7e22ce 0%, #a855f7 50%, #7e22ce 100%)" }} />

            <CardHeader className="flex flex-col items-center pt-8 pb-4">
              {/* Logo with glow effect */}
              <div className="mb-6 relative">
                <div className="absolute inset-0 rounded-2xl opacity-20" style={{ background: "linear-gradient(135deg, #7e22ce, #a855f7)" }}></div>
                <img src={logo} alt="Syrian Insurance Federation" className="w-28 h-28 relative" />
              </div>

              <CardTitle className="text-center text-3xl font-extrabold text-transparent bg-clip-text" style={{ backgroundImage: "linear-gradient(135deg, #7e22ce 0%, #a855f7 100%)" }}>
                تسجيل دخول الأدمن
              </CardTitle>
              <p className="text-center text-sm text-slate-500 mt-3 font-medium">
                منصة إدارة التأمين الإلزامي
              </p>
            </CardHeader>

            <CardContent className="space-y-5 px-6 pb-8">
              {error && (
                <div className="flex items-start gap-3 bg-red-50 border-2 border-red-300 rounded-xl p-4 text-red-700 animate-pulse">
                  <AlertCircle className="h-5 w-5 mt-0.5 flex-shrink-0" />
                  <span className="text-sm font-medium">{error}</span>
                </div>
              )}

              <div className="space-y-2.5">
                <Label htmlFor="username" className="text-slate-700 font-semibold">اسم المستخدم</Label>
                <div className="relative group">
                  <User className="absolute right-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-violet-500 transition-colors group-focus-within:text-violet-700" />
                  <Input
                    id="username"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && handleLogin()}
                    disabled={loading}
                    className="pr-11 py-2.5 border-2 border-violet-200 rounded-lg focus:border-violet-600 focus:ring-2 focus:ring-violet-100 transition-all bg-white/50 backdrop-blur-sm"
                    placeholder="أدخل اسم المستخدم"
                  />
                </div>
              </div>

              <div className="space-y-2.5">
                <Label htmlFor="password" className="text-slate-700 font-semibold">كلمة المرور</Label>
                <div className="relative group">
                  <Lock className="absolute right-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-violet-500 transition-colors group-focus-within:text-violet-700" />
                  <Input
                    id="password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && handleLogin()}
                    disabled={loading}
                    className="pr-11 py-2.5 border-2 border-violet-200 rounded-lg focus:border-violet-600 focus:ring-2 focus:ring-violet-100 transition-all bg-white/50 backdrop-blur-sm"
                    placeholder="أدخل كلمة المرور"
                  />
                </div>
              </div>

              <Button
                onClick={handleLogin}
                disabled={loading}
                className="w-full py-3 mt-6 text-lg font-bold rounded-xl border-2 border-violet-700 transition-all duration-200 hover:shadow-lg hover:scale-105 active:scale-95"
                style={{
                  background: "linear-gradient(135deg, #7e22ce 0%, #6d28d9 100%)",
                  color: "white"
                }}
              >
                {loading ? (
                  <span className="flex items-center justify-center gap-2">
                    <span className="animate-spin">⏳</span>
                    جاري تسجيل الدخول...
                  </span>
                ) : (
                  "دخول"
                )}
              </Button>

              <p className="text-center text-xs text-slate-500 mt-4">
                © 2024 الاتحاد السوري لشركات التأمين
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
