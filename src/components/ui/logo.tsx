import Image from "next/image";
import { cn } from "@/lib/utils";

interface LogoProps {
  size?: "sm" | "md" | "lg" | "xl";
  showText?: boolean;
  className?: string;
  textClassName?: string;
  containerClassName?: string;
  iconOnly?: boolean;
}

const sizeConfig = {
  sm: { width: 24, height: 24 },
  md: { width: 32, height: 32 },
  lg: { width: 42, height: 42 },
  xl: { width: 52, height: 52 },
};

const textSizeConfig = {
  sm: "text-sm",
  md: "text-base",
  lg: "text-lg",
  xl: "text-xl",
};

const subtitleSizeConfig = {
  sm: "text-xs",
  md: "text-sm",
  lg: "text-sm",
  xl: "text-sm",
};

export default function Logo({
  size = "md",
  showText = true,
  className,
  textClassName,
  containerClassName,
  iconOnly = false,
}: LogoProps) {
  const { width, height } = sizeConfig[size];
  const textSize = textSizeConfig[size];
  const subtitleSize = subtitleSizeConfig[size];

  if (iconOnly) {
    return (
      <Image
        src="/documet.png"
        alt="Documet logo"
        width={width}
        height={height}
        className={cn("rounded-lg", className)}
      />
    );
  }

  return (
    <div className={cn("flex items-center gap-3", containerClassName)}>
      <div className={cn("flex-shrink-0", className)}>
        <Image
          src="/documet.png"
          alt="Documet logo"
          width={width}
          height={height}
          className="rounded-lg"
        />
      </div>
      {showText && (
        <div className="flex flex-col gap-0">
          <span className={cn("font-bold text-gray-900", textSize, textClassName)}>
            Documet
          </span>
          <span className={cn("font-medium text-gray-500", subtitleSize)}>
            Make your document an intelligent, shareable assistant
          </span>
        </div>
      )}
    </div>
  );
} 