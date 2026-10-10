/**
 * Preview Bridge Script
 * Injected exclusively during live preview/editor mode (never in exported sites).
 * Enables section selection overlays, inline contentEditable text editing, image replacement,
 * and live section DOM patching over postMessage.
 */

export function getPreviewBridgeScript(isEditMode: boolean = false): string {
  return `
<script id="siteforge-preview-bridge">
(function() {
  var isEditMode = ${isEditMode};
  var selectedSectionId = null;

  function initBridge() {
    window.addEventListener('message', function(event) {
      if (!event.data || typeof event.data !== 'object') return;
      var msg = event.data;

      if (msg.type === 'SET_EDIT_MODE') {
        isEditMode = !!msg.enabled;
        updateOverlayStyles();
      } else if (msg.type === 'PATCH_SECTION_HTML') {
        patchSectionDOM(msg.sectionId, msg.html);
      } else if (msg.type === 'HIGHLIGHT_SECTION') {
        highlightSection(msg.sectionId);
      }
    });

    document.addEventListener('mouseover', function(e) {
      if (!isEditMode) return;
      var sectionEl = e.target.closest('[data-section-id]');
      if (sectionEl) {
        sectionEl.style.outline = '2px dashed #0b57d0';
        sectionEl.style.outlineOffset = '-2px';
      }
    });

    document.addEventListener('mouseout', function(e) {
      if (!isEditMode) return;
      var sectionEl = e.target.closest('[data-section-id]');
      if (sectionEl && sectionEl.getAttribute('data-section-id') !== selectedSectionId) {
        sectionEl.style.outline = 'none';
      }
    });

    document.addEventListener('click', function(e) {
      if (!isEditMode) return;
      
      // If clicking interactive elements in edit mode, prevent default navigation
      var sectionEl = e.target.closest('[data-section-id]');
      if (sectionEl) {
        var secId = sectionEl.getAttribute('data-section-id');
        var secType = sectionEl.getAttribute('data-section-type') || 'section';
        selectedSectionId = secId;
        
        // Notify parent editor
        window.parent.postMessage({
          type: 'SECTION_CLICKED',
          sectionId: secId,
          sectionType: secType
        }, '*');

        updateOverlayStyles();
      }

      // If clicking image
      if (e.target.tagName === 'IMG') {
        e.preventDefault();
        window.parent.postMessage({
          type: 'IMAGE_CLICKED',
          src: e.target.src,
          alt: e.target.alt || '',
          sectionId: sectionEl ? sectionEl.getAttribute('data-section-id') : null
        }, '*');
      }
    });

    document.addEventListener('dblclick', function(e) {
      if (!isEditMode) return;
      var target = e.target;
      if (['H1','H2','H3','H4','H5','H6','P','SPAN','A','BUTTON'].includes(target.tagName)) {
        target.contentEditable = 'true';
        target.focus();
        target.style.outline = '2px solid #0078d4';
        
        var onBlur = function() {
          target.contentEditable = 'false';
          target.style.outline = 'none';
          target.removeEventListener('blur', onBlur);
          
          var sectionEl = target.closest('[data-section-id]');
          window.parent.postMessage({
            type: 'INLINE_TEXT_UPDATED',
            sectionId: sectionEl ? sectionEl.getAttribute('data-section-id') : null,
            tagName: target.tagName,
            newText: target.innerText.trim()
          }, '*');
        };
        target.addEventListener('blur', onBlur);
      }
    });
  }

  function patchSectionDOM(secId, newHtml) {
    var sectionEl = document.querySelector('[data-section-id="' + secId + '"]');
    if (sectionEl && newHtml) {
      var temp = document.createElement('div');
      temp.innerHTML = newHtml.trim();
      var newEl = temp.firstElementChild;
      if (newEl) {
        sectionEl.parentNode.replaceChild(newEl, sectionEl);
        if (isEditMode) updateOverlayStyles();
      }
    }
  }

  function updateOverlayStyles() {
    var sections = document.querySelectorAll('[data-section-id]');
    sections.forEach(function(sec) {
      if (sec.getAttribute('data-section-id') === selectedSectionId && isEditMode) {
        sec.style.outline = '3px solid #0b57d0';
        sec.style.outlineOffset = '-3px';
      } else if (!isEditMode) {
        sec.style.outline = 'none';
      }
    });
  }

  function highlightSection(secId) {
    selectedSectionId = secId;
    updateOverlayStyles();
    var sec = document.querySelector('[data-section-id="' + secId + '"]');
    if (sec) sec.scrollIntoView({ behavior: 'smooth', block: 'center' });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initBridge);
  } else {
    initBridge();
  }
})();
</script>
`;
}
