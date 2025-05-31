import { Moon, Sun, Monitor } from "lucide-react"

import { Button } from "../components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "../components/ui/dropdown-menu"
import { useTheme } from "../components/theme-provider"

export function ModeToggle() {
  const { theme, setTheme } = useTheme()

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="outline"
          size="icon"
          className="focus-visible:ring-0 focus-visible:outline-none focus-visible:border-none"
          onMouseDown={e => e.preventDefault()}
        >
          {/* Sun icon - chỉ hiển thị khi light theme */}
          <Sun className={`h-[1.2rem] w-[1.2rem] transition-all ${
            theme === "light" 
              ? "rotate-0 scale-100" 
              : "-rotate-90 scale-0"
          } ${theme !== "light" ? "absolute" : ""}`} />
          
          {/* Moon icon - chỉ hiển thị khi dark theme */}
          <Moon className={`h-[1.2rem] w-[1.2rem] transition-all ${
            theme === "dark" 
              ? "rotate-0 scale-100" 
              : "rotate-90 scale-0"
          } ${theme !== "dark" ? "absolute" : ""}`} />
          
          {/* Monitor icon - chỉ hiển thị khi system theme */}
          <Monitor className={`h-[1.2rem] w-[1.2rem] transition-all ${
            theme === "system" 
              ? "rotate-0 scale-100" 
              : "rotate-90 scale-0"
          } ${theme !== "system" ? "absolute" : ""}`} />
          
          <span className="sr-only">Toggle theme</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onClick={() => setTheme("light")}>
          <Sun className="mr-2 h-4 w-4" />
          Light
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => setTheme("dark")}>
          <Moon className="mr-2 h-4 w-4" />
          Dark
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => setTheme("system")}>
          <Monitor className="mr-2 h-4 w-4" />
          System
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}