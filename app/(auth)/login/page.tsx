"use client"

import { Button } from "@/components/ui/button";
import { MoveLeft } from "lucide-react";
import Link from "next/link";
import LoginForm from "@/components/auth/login-form";
import FigmaIcon from "@/components/svg/figma-icon";
import DiscordIcon from "@/components/svg/discord-icon";
import GithubIcon from "@/components/svg/github-icon";
import GoogleIcon from "@/components/svg/google-icon";
import OAuthButton from "@/components/ui/oAuth-button";
import { onClick } from "@/utils/oauth-login-function";
import { useSearchParams } from "next/navigation";
import PagesSideUi from "@/components/ui/pages-side-ui";

export default function Login() {

    const searchParams = useSearchParams();
    const error = searchParams.get("error") === "OAuthAccountNotLinked"
        ? "Email already linked with another provider."
        : null

    return (
        <main className="flex flex-row w-full h-[100lvh]">
            <PagesSideUi />
            <section className="flex-1 relative flex items-center justify-center xs:w-[100%] bg-[#191919] custom-padding">
                <div className="absolute md:top-10 md:left-12 top-2 left-4">
                    <Button variant="custom_home">
                        <MoveLeft className="text-white" />
                        <span className="text-white text-sm">Home</span>
                    </Button>
                </div>
                <div className="flex flex-col max-w-[350px] gap-4 w-full">
                    <div className="flex flex-col">
                        <h3 className="text-[#ffffff] text-[24px] font-[400]">Login to your account</h3>
                        <p className="text-[#bfbfbf] text-[16px]">Connect to Flaw with:</p>
                    </div>
                    <div className="flex flex-col gap-y-4">
                        <div className="flex flex-row gap-x-4">
                            <OAuthButton onClick={()=> onClick("google")}>
                                <GoogleIcon />
                                <span className="text-[#141414] text-[14px]">Google</span>
                            </OAuthButton>
                            <OAuthButton onClick={()=> onClick("github")}>
                                <GithubIcon />
                                <span className="text-[#141414] text-[14px]">GitHub</span>
                            </OAuthButton>
                        </div>
                        <div className="flex flex-row gap-x-4">
                            <OAuthButton onClick={()=> onClick("figma")}>
                                <FigmaIcon />
                                <span className="text-[#141414] text-[14px]">Figma</span>
                            </OAuthButton>
                            <OAuthButton onClick={()=> onClick("discord")}>
                                <DiscordIcon />
                                <span className="text-[#141414] text-[14px]">Discord</span>
                            </OAuthButton>
                        </div>
                    </div>
                    <div className="flex items-center justify-center gap-x-4">
                        <div className="border-[#bfbfbf] border-1 w-[74px]"></div>
                        <span className="text-[#bfbfbf] text-[12px]">OR LOGIN WITH YOUR EMAIL</span>
                        <div className="border-[#bfbfbf] border-1 w-[74px]"></div>
                    </div>
                    <LoginForm errorMessage={error} />
                    <h6 className="text-white">New to Flaw? <span className="text-blue-500 font-semibold"><Link href="/">Signup for an account</Link></span></h6>
                </div>
            </section>
        </main>
    );
}
