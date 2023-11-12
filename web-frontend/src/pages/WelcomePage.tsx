import KeyLogo from "@/components/KeyLogo";
import { Button } from "@/components/ui/button";
import useAuthStore from "@/hooks/stores/useAuthStore";
import { useNavigate } from "react-router-dom";

export default function WelcomePage() {
  const navigate = useNavigate();
  const login = useAuthStore((state) => state.actions.login);

  return (
    <div className="h-screen w-screen flex flex-col items-center justify-center gap-8">
      <KeyLogo height={140} width={140} />

      <p className="text-sm text-muted-foreground">
        Own your digital identity, data, and finances.
      </p>

      <div className="flex flex-col gap-2">
        <Button
          className="w-[300px]"
          onClick={() => {
            login()
              .then(() => {
                navigate("/");
              })
              .catch((err) => {
                console.log(err);
              });
          }}
        >
          Log in
        </Button>
        <Button variant={"ghost"} onClick={() => navigate("/create-profile")}>
          Create an Account
        </Button>
      </div>
    </div>
  );
}
