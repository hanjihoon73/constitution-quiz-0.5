"use client"

import {
  CircleCheckIcon,
  InfoIcon,
  Loader2Icon,
  OctagonXIcon,
  TriangleAlertIcon,
} from "lucide-react"
import { useTheme } from "next-themes"
import { Toaster as Sonner, type ToasterProps } from "sonner"

const Toaster = ({ ...props }: ToasterProps) => {
  const { theme = "system" } = useTheme()

  return (
    <Sonner
      theme={theme as ToasterProps["theme"]}
      className="toaster group"
      icons={{
        success: <CircleCheckIcon className="size-4" />,
        info: <InfoIcon className="size-4 text-[#FF8400]" />,
        warning: <TriangleAlertIcon className="size-4" />,
        error: <OctagonXIcon className="size-4" />,
        loading: <Loader2Icon className="size-4 animate-spin" />,
      }}
      style={
        {
          "--normal-bg": "#2D2D2D",
          "--normal-text": "#FF8400",
          "--normal-border": "#2D2D2D",
          "--success-bg": "#2D2D2D",
          "--success-text": "#FF8400",
          "--success-border": "#2D2D2D",
          "--error-bg": "#2D2D2D",
          "--error-text": "#FF8400",
          "--error-border": "#2D2D2D",
          "--info-bg": "#2D2D2D",
          "--info-text": "#FF8400",
          "--info-border": "#2D2D2D",
          "--warning-bg": "#2D2D2D",
          "--warning-text": "#FF8400",
          "--warning-border": "#2D2D2D",
          "--border-radius": "12px",
        } as React.CSSProperties
      }
      {...props}
    />
  )
}

export { Toaster }
