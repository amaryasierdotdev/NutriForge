export class AccessibilityManager {
  private static focusHistory: HTMLElement[] = []

  static enhanceKeyboardNavigation(): void {
    document.addEventListener('keydown', this.handleKeyboardNavigation)
  }

  private static handleKeyboardNavigation(e: KeyboardEvent): void {
    if (e.key === 'Tab') {
      this.trackFocus(e.target as HTMLElement)
    }
    
    if (e.key === 'Escape') {
      this.restoreFocus()
    }
  }

  private static trackFocus(element: HTMLElement): void {
    if (element && this.focusHistory[this.focusHistory.length - 1] !== element) {
      this.focusHistory.push(element)
      if (this.focusHistory.length > 10) {
        this.focusHistory.shift()
      }
    }
  }

  static restoreFocus(): void {
    const lastFocused = this.focusHistory.pop()
    if (lastFocused && document.contains(lastFocused)) {
      lastFocused.focus()
    }
  }

  static addAriaLabel(element: HTMLElement, label: string): void {
    element.setAttribute('aria-label', label)
  }

  static addAriaDescription(element: HTMLElement, description: string): void {
    element.setAttribute('aria-describedby', description)
  }

  static markAsRequired(element: HTMLElement): void {
    element.setAttribute('aria-required', 'true')
  }

  static setRole(element: HTMLElement, role: string): void {
    element.setAttribute('role', role)
  }
}