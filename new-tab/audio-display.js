class AudioDisplay {
    eventNames = ['onLevelChanged', 'onMuteChanged']; // Adjust the events based on your needs

    constructor(element) {
        this.element = element;
        this.render();
        this.listenForUpdates();
    }

    async getAudio() {
        return new Promise(resolve => {
            chrome.audio.getDevices({}, devices => {
                const outputDevices = devices.filter(device => device.deviceType === "OUTPUT");
                if (outputDevices.length > 0) {
                    const outputDevice = outputDevices[0];
                    resolve(outputDevice);
                } else {
                    resolve(null);
                }
            });
        });
    }

    async render() {
        let audio = await this.getAudio();

        if (audio) {
            this.element.textContent = [
                this.getVolumeMessage(audio),
                this.getMuteMessage(audio)
            ].join(" ~ ");
        } else {
            this.element.textContent = "No audio device available.";
        }
    }

    getVolumeMessage(audio) {
        return `Volume: ${Math.round(audio.level * 100)}%`;
    }

    getMuteMessage(audio) {
        return audio.isMuted ? "Muted" : "Not muted";
    }

    async listenForUpdates() {
        let audio = await this.getAudio();

        if (audio) {
            for (let eventName of this.eventNames) {
                chrome.audio[eventName].addListener(() => {
                    this.render();
                });
            }
        }
    }
}

export { AudioDisplay };
