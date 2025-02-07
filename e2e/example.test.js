describe('Example Test', () => {
    beforeAll(async () => {
        console.log('Launching app...');
        await device.launchApp();
        console.log('App launched successfully!');
    });

    it('should display welcome screen', async () => {
        await waitFor(element(by.id('welcomeScreen')))
            .toBeVisible()
            .withTimeout(5000); // Waits for 5 seconds
    });
});
