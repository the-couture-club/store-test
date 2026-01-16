let giftCardFormOpen = false;
function toggleMainSubmitGiftCard(active) {
  document
    .querySelectorAll('form.js-product-form .product-form__add-btn')
    .forEach((btn) => btn.classList.toggle('js-gift-card', !!active));
}

if (window.jQuery) {
  $(document).on('mfpClose', function() {
    if (!giftCardFormOpen) return;
    giftCardFormOpen = false;
    toggleMainSubmitGiftCard(true);
  });
}

document.addEventListener('click', function(e) {
  const giftCardTrigger = e.target.closest('.js-gift-card');
  if (!giftCardTrigger) return;

  e.preventDefault();
  theme.mfpOpen('gift-card-form');

  giftCardFormOpen = true;
  toggleMainSubmitGiftCard(false);
});

document.addEventListener('change', function(e) {
  const checkbox = e.target.closest('.recipient-checkbox');
  if (!checkbox) return;

  const container = checkbox.closest('.recipient-form') || document;
  const fields = container.querySelectorAll('.recipient-fields__field');

  fields.forEach((field) => {
    const controls = field.querySelectorAll('input, textarea, select');
    if (checkbox.checked) {
      field.classList.remove('disabled');
      controls.forEach((control) => control.removeAttribute('disabled'));
    } else {
      field.classList.add('disabled');
      controls.forEach((control) => control.setAttribute('disabled', ''));
    }
  });
});

function collectGiftCardData(root) {
  if (!root) return;

  const container =
    root.closest('form') ||
    root.closest('.recipient-form') ||
    root.closest('#gift-card-form') ||
    root;

  const enabledFields = Array.from(
    container.querySelectorAll('input, textarea, select')
  ).filter((field) => !field.disabled && field.name);

  // Validate recipient form when fields are active
  if (enabledFields.length) {
    const firstInvalid = enabledFields.find((field) => !field.checkValidity());
    if (firstInvalid) {
      if (typeof firstInvalid.reportValidity === 'function') {
        firstInvalid.reportValidity();
      }
      return;
    }
  }

  const collected = {};
  enabledFields.forEach((field) => {
    const { type, name, value, checked, multiple, options } = field;

    if ((type === 'checkbox' || type === 'radio') && !checked) return;

    if (multiple && options) {
      collected[name] = Array.from(options)
        .filter((opt) => opt.selected)
        .map((opt) => opt.value);
    } else {
      collected[name] = value;
    }
  });

  container.dispatchEvent(
    new CustomEvent('gift-card:collect', {
      detail: { fields: collected },
      bubbles: true,
    })
  );
}

document.addEventListener('click', function(e) {
  const submitBtn = e.target.closest('.js-gift-card-submit');
  if (!submitBtn) return;

  collectGiftCardData(submitBtn);
}, true);

document.addEventListener('submit', function(e) {
  const form = e.target.closest('form') || e.target.closest('.recipient-form');
  if (!form) return;
  if (!form.querySelector('.js-gift-card-submit')) return;

  collectGiftCardData(form);
});

document.addEventListener('gift-card:collect', function(e) {
  console.log('Gift card data collected:', e.detail.fields);

  const mainForm =
    document.querySelector('form.js-product-form') ||
    document.querySelector('form[action^="/cart/add"]');

  if (!mainForm) return;

  const recipientFlagName = 'properties[__shopify_send_gift_card_to_recipient]';
  const recipientFlag = mainForm.querySelector(`[name="${recipientFlagName}"]`);

  const finalize = () => {
    const addBtn = mainForm.querySelector('.js-product-add');
    if (addBtn) {
      addBtn.click();
    }

    if (window.jQuery && $.magnificPopup) {
      $.magnificPopup.close();
    }
  };

  const restoreDisabled = () => {
    const toRestore = mainForm.querySelectorAll('[data-gift-card-was-disabled="1"]');
    toRestore.forEach((el) => {
      el.setAttribute('disabled', '');
      el.removeAttribute('data-gift-card-was-disabled');
    });
  };

  if (!e.detail || !e.detail.fields || !Object.keys(e.detail.fields).length) {
    if (recipientFlag) {
      recipientFlag.setAttribute('disabled', '');
    }
    restoreDisabled();
    finalize();
    return;
  }

  // Force Shopify gift card flag to true (avoids default "on" for checkboxes)
  if (recipientFlag) {
    if (!recipientFlag.dataset.giftCardWasDisabled && recipientFlag.disabled) {
      recipientFlag.dataset.giftCardWasDisabled = '1';
    }
    recipientFlag.removeAttribute('disabled');
    if (recipientFlag.type === 'checkbox' || recipientFlag.type === 'radio') {
      recipientFlag.checked = true;
    } else {
      recipientFlag.value = 'true';
    }
  }

  const escapeName = (name) => {
    if (window.CSS && CSS.escape) return CSS.escape(name);
    return name.replace(/"/g, '\\"');
  };

  Object.entries(e.detail.fields).forEach(([name, value]) => {
    const controls = mainForm.querySelectorAll(`[name="${escapeName(name)}"]`);
    controls.forEach((control) => {
      if (!control.dataset.giftCardWasDisabled && control.disabled) {
        control.dataset.giftCardWasDisabled = '1';
      }
      control.removeAttribute('disabled');

      if (control.type === 'checkbox' || control.type === 'radio') {
        if (Array.isArray(value)) {
          control.checked = value.includes(control.value);
        } else {
          control.checked = value === control.value || Boolean(value);
        }
      } else {
        if (Array.isArray(value)) {
          control.value = value[0] ?? '';
        } else {
          control.value = value;
        }
      }
    });
  });

  finalize();
});
