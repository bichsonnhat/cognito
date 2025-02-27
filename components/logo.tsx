import { BrainCircuit } from "lucide-react";
import { Poppins } from 'next/font/google';

import { cn } from "@/lib/utils";
import Image from "next/image";

const poppins = Poppins({ weight: "700", subsets: ['latin'] });

interface LogoProps {
  className?: string;
}

const Logo: React.FC<LogoProps> = ({ className }) => {
  return (
    <div className={cn(
      "flex items-center",
      className
    )}>
      <Image src={"/icons/logo.svg"} alt="logo" width={32} height={32}/>
      <span className={cn(
        "ml-2 font-bold text-3xl",
        poppins.className
      )}>Cognito</span>
    </div>
  )
}

export default Logo;
