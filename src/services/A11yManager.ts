export class A11yManager {
  private static announcer: HTMLElement | null = null

  static init(): void {
    if (!this.announcer) {
      this.announcer = document.createElement('div')
      this.announcer.setAttribute('aria-live', 'polite')
      this.announcer.setAttribute('aria-atomic', 'true')
      this.announcer.style.position = 'absolute'
      this.announcer.style.left = '-10000px'
      this.announcer.style.width = '1px'
      this.announcer.style.height = '1px'
      this.announcer.style.overflow = 'hidden'
      document.body.appendChild(this.announcer)
    }
  }

  static announce(message: string, priority: 'polite' | 'assertive' = 'polite'): void {
    if (!this.announcer) this.init()
    
    this.announcer!.setAttribute('aria-live', priority)
    this.announcer!.textContent = message
    
    setTimeout(() => {
      this.announcer!.textContent = ''
    }, 1000)
  }

  static setFocus(element: HTMLElement): void {
    element.focus()
    element.scrollIntoView({ behavior: 'smooth', block: 'center' })
  }

  static trapFocus(container: HTMLElement): () => void {
    const focusableElements = container.querySelectorAll(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    ) as NodeListOf<HTMLElement>
    
    const firstElement = focusableElements[0]
    const lastElement = focusableElements[focusableElements.length - 1]

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Tab') {
        if (e.shiftKey && document.activeElement === firstElement) {
          e.preventDefault()
          lastElement.focus()
        } else if (!e.shiftKey && document.activeElement === lastElement) {
          e.preventDefault()
          firstElement.focus()
        }
      }
    }

    container.addEventListener('keydown', handleKeyDown)
    return () => container.removeEventListener('keydown', handleKeyDown)
  }
}