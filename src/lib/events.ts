export const showToast = (message: string) => {
    // setToastMessage(message);
    // setToastVisible(true);
    // if (toastTimer.current) window.clearTimeout(toastTimer.current);
    // toastTimer.current = window.setTimeout(() => {
    //   setToastVisible(false);
    //   toastTimer.current = null;
    // }, 2000);

    const event = new CustomEvent("toast", {
        detail: {
            message,
        },
    });
    window.dispatchEvent(event);
};