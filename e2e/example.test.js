describe('Example Test', () => {
    beforeAll(async () => {
        await device.launchApp();
    });

    it('should display welcome screen', async () => {
        await waitFor(element(by.id('welcomeScreen')))
            .toBeVisible()
            .withTimeout(5000); // Waits for 5 seconds
    });
});
