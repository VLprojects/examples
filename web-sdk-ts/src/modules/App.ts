import Client from '@livedigital/client';
import type PeerTrack from '@livedigital/client/dist/engine/media/tracks/PeerTrack';
import type ClientPeer from '@livedigital/client/dist/engine/Peer';
import {Track} from '@livedigital/client/dist/types/media';

import Peer from './Peer';

import {PeerCallbacks} from '../types';
import {AvailableMediaDevices} from '@livedigital/client/src/types/common';
import {joinParams} from '../config';


class App {
  private rootEl: HTMLElement | null = null;

  private readonly client: Client | null;

  private peers: Map<string, Peer> = new Map();

  private micTrack: Track | null = null;

  private cameraTrack: Track | null = null;

  private ui: Record<string, HTMLButtonElement> = {};

  private isJoining = false;

  private isDisconnecting = false;

  private devices: AvailableMediaDevices = {
    video: [],
    audio: [],
  };

  private videoEnabled = false;

  private audioEnabled = false;

  private callbacks: PeerCallbacks = {
    onTrackStart: (track: PeerTrack, peer: Peer) => { this.onPeerTrackStart(track, peer); },
    onTrackEnd: (track: PeerTrack, peer: Peer) => { this.onPeerTrackEnd(track, peer); },
    onTrackPaused: (track: PeerTrack, peer: Peer) => { this.onPeerTrackEnd(track, peer); },
    onTrackResumed: (track: PeerTrack, peer: Peer) => { this.onPeerTrackStart(track, peer); },
  };

  constructor() {
    this.client = new Client({
      network: {
        loadbalancer: {
          baseURL: 'https://lb.livedigital.space/v1',
        },
      },
      logLevel: 7,
      onLogMessage: (msg: string, meta: Record<string, unknown> = {}) => {
        console.log(msg, meta); // you can get some debug info here
      },
    });
    this.listenChannelEvents();
  }

  init(rootElId: string) {
    this.rootEl = document.querySelector(`#${rootElId}`);
    this.initUI();
    this.initMediaDevices();
  }

  private listenChannelEvents(): void {
    if (!this.client) {
      throw new Error('Client not initialized');
    }

    this.client.observer.on('peer-joined', (peer: ClientPeer) => {
      if (peer.role !== 'host' || this.peers.has(peer.id)) {
        return;
      }

      const newPeer = new Peer(peer, this.callbacks);
      this.peers.set(peer.id, newPeer);
    });

    this.client.observer.on('peer-left', (peerId: string) => {
      if (peerId) {
        this.peers.delete(peerId);
        const videoEl = this.rootEl?.querySelector('#remote-video') as HTMLVideoElement;
        (videoEl.srcObject as MediaStream)?.getTracks().forEach((t) => t.stop());
        videoEl.srcObject = null;
      }
    });
  }

  private async join() {
    if (!this.client) {
      throw new Error('Client not intialized');
    }

    const {
      channelId,
      token,
      role,
    } = joinParams;

    try {
      await this.client.join({
        token,
        channelId,
        appData: {
          someKey: 'someValue', // The data specified in appData will be available to all conference participants. For example, this can be used for the username, his states, etc.
        },
        role,
      });
    } catch (error: unknown) {
      console.log('JOIN ERROR', error);
    }
  }

  private async leaveRoom() {
    const myVideoEl = this.rootEl?.querySelector<HTMLVideoElement>('#me-video');
    if (myVideoEl) {
      myVideoEl.srcObject = null;
    }

    const remoteVideoEl = this.rootEl?.querySelector<HTMLVideoElement>('#remote-video');
    if (remoteVideoEl) {
      remoteVideoEl.srcObject = null;
    }


    this.isDisconnecting = true;
    this.updateUI();
    try {
      await Promise.all([
        this.disableAudio(),
        this.disableVideo(),
      ])

      this.micTrack = null;
      this.cameraTrack = null;
      await this.client?.leave();
      this.peers.clear();
    } catch (error) {
      console.error('Failed to leave room', error);
    }

    this.isDisconnecting = false;
    this.updateUI();
  }

  private async joinRoom() {
    this.isJoining = true;
    this.updateUI();
    try {
      await this.join();
      await this.loadPeers();
    } catch (error) {
      console.error('Failed to join', error);
    }

    this.isJoining = false;
    this.updateUI();
  }

  private async loadPeers() {
    if (!this.client) {
      throw new Error('Client not initialized');
    }

    await this.client.loadPeers('host');
    const { peers } = this.client;

    peers.forEach((peer) => {
      if (this.peers.has(peer.id) || peer.isMe) {
        return;
      }

      const newPeer = new Peer(peer, this.callbacks);
      this.peers.set(peer.id, newPeer);
    });
  }

  private async initMediaDevices() {
    if (!this.client) {
      return;
    }

    try {
      this.devices = await this.client.detectDevices();
      console.log('Available devices', this.devices);
    } catch (error) {
      console.error('Error getting meida devices', error);
    }
  }

  private async enableAudio() {
    this.ui.micToggle.disabled = true;
    try {
      if (this.devices.audio.length && !this.micTrack) {
        this.micTrack = await this.client?.createMicrophoneAudioTrack({ audio: { deviceId: 'default' } }) ?? null;
      }

      await (this.micTrack?.isPublished ? this.micTrack.resume() : await this.micTrack?.publish());
      this.audioEnabled = true;
    } catch (error) {
      console.error('Mic error', error);
    }
    this.ui.micToggle.disabled = false;
  }

  private async disableAudio() {
    this.ui.micToggle.disabled = true;
    try {
      await (this.micTrack?.isPublished ? this.micTrack.pause() : await this.micTrack?.unpublish());
      this.audioEnabled = false;
    } catch (error) {
      console.error('Mic error', error);
    }
    this.ui.micToggle.disabled = true;
  }

  private async enableVideo() {
    this.ui.cameraToggle.disabled = true;
    const videoEl = this.rootEl?.querySelector<HTMLVideoElement>('#me-video');
    if (!videoEl || !this.client) {
      throw new Error('App not initialized');
    }

    try {
      if (this.devices.video.length && !this.cameraTrack) {
        this.cameraTrack = await this.client?.createCameraVideoTrack({ video: { deviceId: 'default' } });
        videoEl.srcObject = new MediaStream([this.cameraTrack.mediaStreamTrack]);
      }

      await (this.cameraTrack?.isPublished ? this.cameraTrack.resume() : await this.cameraTrack?.publish());
      this.videoEnabled = true;
    } catch (error) {
      console.error('Camera error', error);
    }
    this.ui.cameraToggle.disabled = false;
  }

  private async disableVideo() {
    this.ui.cameraToggle.disabled = true;
    try {
      await (this.cameraTrack?.isPublished ? this.cameraTrack.pause() : await this.cameraTrack?.unpublish());
      this.videoEnabled = false;

      const videoEl = this.rootEl?.querySelector('#my-video') as HTMLVideoElement;
      if (!videoEl) {
        return;
      }

      videoEl.srcObject = null;
    } catch (error) {
      console.error('Camera error', error);
    }
    this.ui.cameraToggle.disabled = false;
  }

  private async onPeerTrackStart(track: PeerTrack, peer: Peer) {
    // for simplicity we have only one video slot for remote participants
    if (peer.peer.isMe) {
      return;
    }

    const videoEl = this.rootEl?.querySelector('#remote-video') as HTMLVideoElement;
    if (videoEl) {
      const stream = (videoEl.srcObject || new MediaStream()) as MediaStream;
      videoEl.srcObject = stream;
      await track.unmute();
      stream.addTrack(track.mediaStreamTrack);
    }
  }

  private onPeerTrackEnd(track: PeerTrack, peer: Peer) {
    console.log('Track end', track);
    if (peer.peer.isMe) {
      return;
    }

    if (track.kind !== 'video') {
      return;
    }


    const videoEl = this.rootEl?.querySelector('#remote-video') as HTMLVideoElement;
    if (!videoEl) {
      return;
    }

    videoEl.srcObject = null;
  }

  private async toggleMic() {
    await (this.audioEnabled ? this.disableAudio() : this.enableAudio());
    this.updateUI();
  }

  private async toggleCamera() {
    await (this.videoEnabled ? this.disableVideo() : this.enableVideo());
    this.updateUI();
  }

  private updateUI() {
    const isJoined = Boolean(this.client?.peers.length);
    this.ui.joinButton.disabled = isJoined || this.isJoining;
    this.ui.leaveButton.disabled = !isJoined || this.isJoining || this.isDisconnecting;
    this.ui.joinButton.innerText = this.isJoining ? 'Joining...' : 'Join';
    this.ui.leaveButton.innerText = this.isDisconnecting ? 'Disconnecting...' : 'Disconnect';
    this.ui.micToggle.disabled = Boolean(!isJoined);
    this.ui.cameraToggle.disabled = Boolean(!isJoined);
    this.ui.micToggle.innerText = !this.micTrack || this.micTrack?.isPaused ? 'Enable mic' : 'Disable mic';
    this.ui.cameraToggle.innerText = !this.cameraTrack || this.cameraTrack?.isPaused ? 'Enable cam' : 'Disable cam';
  }

  private initUI() {
    if (!this.rootEl) {
      throw new Error('App root tag not found');
    }

    this.ui = {
      joinButton: this.rootEl.querySelector('#join-room') as HTMLButtonElement,
      leaveButton: this.rootEl.querySelector('#leave-room') as HTMLButtonElement,
      micToggle: this.rootEl.querySelector('#mic-toggle') as HTMLButtonElement,
      cameraToggle: this.rootEl.querySelector('#camera-toggle') as HTMLButtonElement,
    };

    this.ui.joinButton.onclick = () => { this.joinRoom(); };
    this.ui.leaveButton.onclick = () => { this.leaveRoom(); };
    this.ui.micToggle.onclick = () => { this.toggleMic(); };
    this.ui.cameraToggle.onclick = () => { this.toggleCamera(); };

    this.updateUI();
  }
}

export default new App();
