describe('Example Test', () => {
    beforeAll(async () => {
        await device.launchApp();
    });

    it('should display welcome screen', async () => {
        await expect(element(by.id('welcomeScreen'))).toBeVisible();
    });
});