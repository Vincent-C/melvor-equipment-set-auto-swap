export function setup(ctx) {
    const generalSettings = ctx.settings.section('General');

    generalSettings.add({
        type: 'switch',
        name: 'equipmentSetAutoSwapEnabled',
        label: 'Enable equipment set auto swapping',
        hint: 'Enable this mod. You can choose to disable this if a fight requires the use of a specific combat type, e.g. Cursed Forest.',
        default: true
    });

    generalSettings.add({
        type: 'dropdown',
        name: 'meleeEquipmentSet',
        label: 'Melee equipment set',
        default: -1,
        options: [
            {value: -1, display: 'No option selected.'},
            {value: 0, display: '1'},
            {value: 1, display: '2'},
            {value: 2, display: '3'},
            {value: 3, display: '4'},
            {value: 4, display: '5'},
            {value: 5, display: '6'},
            {value: 6, display: '7'},
            {value: 7, display: '8'}
        ]
    });

    generalSettings.add({
        type: 'dropdown',
        name: 'rangedEquipmentSet',
        label: 'Ranged equipment set',
        default: -1,
        options: [
            {value: -1, display: 'No option selected.'},
            {value: 0, display: '1'},
            {value: 1, display: '2'},
            {value: 2, display: '3'},
            {value: 3, display: '4'},
            {value: 4, display: '5'},
            {value: 5, display: '6'},
            {value: 6, display: '7'},
            {value: 7, display: '8'}
        ]
    });

    generalSettings.add({
        type: 'dropdown',
        name: 'magicEquipmentSet',
        label: 'Magic equipment set',
        default: -1,
        options: [
            {value: -1, display: 'No option selected.'},
            {value: 0, display: '1'},
            {value: 1, display: '2'},
            {value: 2, display: '3'},
            {value: 3, display: '4'},
            {value: 4, display: '5'},
            {value: 5, display: '6'},
            {value: 6, display: '7'},
            {value: 7, display: '8'}
        ]
    });
    
    const choosePlayerAttackTypeForNormalDamage = (enemyAttackType) => {
        switch (enemyAttackType) {
            case 'melee':
                return 'magic';
            case 'ranged':
                return 'melee';
            case 'magic':
                return 'ranged';
            default:
                notifyPlayer(Player, 'Unknown enemy attack type. Please disable mod and file a bug report to mod author.', 'danger');
                return 'unknown';
        }
    };
    
    const choosePlayerAttackTypeForAbyssalDamage = (enemyAttackType) => {
        switch (enemyAttackType) {
            case 'melee':
                return 'ranged';
            case 'ranged':
                return 'magic';
            case 'magic':
                return 'melee';
            default:
                notifyPlayer(Player, 'Unknown enemy attack type. Please disable mod and file a bug report to mod author.', 'danger');
                return 'unknown';
        }
    };

    ctx.patch(CombatManager, 'spawnEnemy').after((result) => {
        if (!generalSettings.get('equipmentSetAutoSwapEnabled')) {
            // take no action if mod is disabled
            return;
        }
        
        const meleeEquipmentSet = generalSettings.get('meleeEquipmentSet');
        const rangedEquipmentSet = generalSettings.get('rangedEquipmentSet');
        const magicEquipmentSet = generalSettings.get('magicEquipmentSet');
        let desiredEquipmentSetIndex = -1;
        
        const enemyAttackType = game.combat.enemy.attackType;
        const enemyDamageType = game.combat.enemy.damageType.id;
        
        if (enemyDamageType === 'melvorItA:Eternal') {
            // I have no idea how this changes the combat triangle and there's no info on the wiki yet
            notifyPlayer(Player, 'Unrecognized damage type (Eternal). Please disable mod and file a bug report to mod author.', 'danger');
            game.combat.stop();
            return;
        }
        
        let playerAttackType = "unknown";
        
        // for valid damage types, see `game.damageTypes`
        switch (enemyDamageType) {
            case 'melvorD:Normal':
            case 'melvorF:Pure':
                playerAttackType = choosePlayerAttackTypeForNormalDamage(enemyAttackType);
                break;
            case 'melvorItA:Abyssal':
                playerAttackType = choosePlayerAttackTypeForAbyssalDamage(enemyAttackType);
                break;
            //case 'melvorItA:Eternal': 
            default:
                break;
        }
        
        if (playerAttackType !== 'melee' && playerAttackType !== 'ranged' && playerAttackType !== 'magic') {
            notifyPlayer(Player, 'Unknown player attack type. Please disable mod and file a bug report to mod author.', 'danger');
            game.combat.stop();
            return;
        }
        
        switch (playerAttackType) {
            case 'melee':
                desiredEquipmentSetIndex = meleeEquipmentSet;
                break;
            case 'ranged':
                desiredEquipmentSetIndex = rangedEquipmentSet;
                break;
            case 'magic':
                desiredEquipmentSetIndex = magicEquipmentSet;
                break;
            default:
                break;
        }

        if (desiredEquipmentSetIndex < 0) {
            notifyPlayer(Player, 'Invalid equipment set selected. Select an equipment set in mod settings.', 'danger');
            game.combat.stop();
            return;
        }

        if (desiredEquipmentSetIndex === game.combat.player.selectedEquipmentSet) {
            // no need to switch equipment sets
            return;
        }
        
        game.combat.player.changeEquipmentSet(desiredEquipmentSetIndex);
    });
}
