export function handleReturn(manager, params) {
    manager.scene.scene.get('SystemScene').events.emit('return-to-novel', params);
}