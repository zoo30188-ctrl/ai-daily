// === AI Daily — Focus Trap 유틸리티 ===

const FOCUSABLE_SELECTOR = 'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])';

/**
 * 재사용 가능한 Focus Trap 생성
 * @param {HTMLElement} containerEl - 포커스를 가둘 컨테이너
 * @returns {{ activate: Function, deactivate: Function }}
 */
export const createFocusTrap = (containerEl) => {
  let previouslyFocused = null;

  const handleKeydown = (e) => {
    if (e.key !== 'Tab') return;

    const focusable = [...containerEl.querySelectorAll(FOCUSABLE_SELECTOR)]
      .filter(el => !el.disabled && el.offsetParent !== null);

    if (focusable.length === 0) {
      e.preventDefault();
      return;
    }

    const first = focusable[0];
    const last = focusable[focusable.length - 1];

    if (e.shiftKey) {
      // Shift+Tab: 첫 번째에서 → 마지막으로
      if (document.activeElement === first) {
        e.preventDefault();
        last.focus();
      }
    } else {
      // Tab: 마지막에서 → 첫 번째로
      if (document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    }
  };

  return {
    /** Focus Trap 활성화 — 이전 포커스 저장 + 첫 번째 요소 포커스 */
    activate() {
      previouslyFocused = document.activeElement;
      document.addEventListener('keydown', handleKeydown);

      // 약간의 지연 후 첫 번째 요소에 포커스 (트랜지션 완료 대기)
      requestAnimationFrame(() => {
        const firstFocusable = containerEl.querySelector(FOCUSABLE_SELECTOR);
        if (firstFocusable) firstFocusable.focus();
      });
    },

    /** Focus Trap 비활성화 — 이전 포커스 복원 */
    deactivate() {
      document.removeEventListener('keydown', handleKeydown);
      if (previouslyFocused && previouslyFocused.focus) {
        previouslyFocused.focus();
      }
    }
  };
};
