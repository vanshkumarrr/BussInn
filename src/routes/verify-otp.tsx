import { createFileRoute } from "@tanstack/react-router";
import VerifyOtp from "../pages/common/VerifyOtp";

export const Route = createFileRoute("/verify-otp")({
  head: () => ({
    meta: [
      { title: "Verify OTP | Bussinn" },
      { name: "description", content: "Bussinn transit app — verify your mobile number with OTP." },
      { property: "og:title", content: "Verify OTP | Bussinn" },
      {
        property: "og:description",
        content: "Bussinn transit app — verify your mobile number with OTP.",
      },
    ],
  }),
  component: VerifyOtp,
});
