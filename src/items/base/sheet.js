import sheetHTML from './sheet.html';
import HeartSheetMixin from '../../common/sheet';
import './preview.sass';

export default class HeartItemSheet extends HeartSheetMixin(ItemSheet) {
    static get type() { return 'base'; }

    get template() {
        return sheetHTML.path;
    }

    get default_img() {
        return 'icons/svg/item-bag.svg';
    }

    get img() {
        return this.default_img;
    }

    get children() {
        return this.item.children;
    }

    get childrenTypes() {
        return this.item.children?.reduce((map, value) => {
            if(map[value.type] === undefined) {
                map[value.type] = [value];
            } else {
                map[value.type].push(value);
            }

            return map;
        }, {});
    }

    activateListeners(html) {
        super.activateListeners(html);

        html.find('[data-action=add-child][data-type]').click(ev => {
            const target = $(ev.currentTarget);
            const documentName = target.data('document-name') || 'Item';
            const type = target.data('type');
            let itemData = target.data('data') || {};

            const id = randomID();
            const data = new CONFIG[documentName].documentClass({_id: id, type: type, name: `New ${type}`, data: itemData}).toObject();
            data.documentName = documentName;
            
            this.item.update({[`data.children.${id}`]: data});
        });

        html.find('[data-item-id] [data-action=edit-child], [data-item-id] [data-action=view]').click(async ev => {
            const target = $(ev.currentTarget);
            const uuid = target.closest('[data-item-id]').data('itemId');
            const item = await fromUuid(uuid);
            item.sheet.render(true);
        });

        html.find('[data-item-id] [data-action=delete-child]').click(async ev => {
            const target = $(ev.currentTarget);
            const uuid = target.closest('[data-item-id]').data('itemId');
            const item = await fromUuid(uuid);
            item.delete();
            this.render(true);
        });

        html.find('[data-item-id] [data-action=activate]').click(async ev => {
            const target = $(ev.currentTarget);
            const uuid = target.closest('[data-item-id]').data('itemId');
            const item = await fromUuid(uuid);
            item.update({'data.active': true});
        });

        html.find('[data-item-id] [data-action=view]').click(async ev => {
            const target = $(ev.currentTarget);
            const uuid = target.closest('[data-item-id]').data('itemId');
            const item = await fromUuid(uuid);
            item.update({'data.active': false});
        });

        html.find('[data-item-id] [data-action=deactivate]').click(async ev => {
            const target = $(ev.currentTarget);
            const uuid = target.closest('[data-item-id]').data('itemId');
            const item = await fromUuid(uuid);
            item.update({'data.active': false});
        });

        html.find('[data-item-id] [data-action=complete]').click(async ev => {
            const target = $(ev.currentTarget);
            const uuid = target.closest('[data-item-id]').data('itemId');
            const item = await fromUuid(uuid);
            item.update({'data.complete': true});
        });

        html.find('[data-item-id] [data-action=uncomplete]').click(async ev => {
            const target = $(ev.currentTarget);
            const uuid = target.closest('[data-item-id]').data('itemId');
            const item = await fromUuid(uuid);
            item.update({'data.complete': false});
        });
    }

    getData() {
        const data = super.getData();
        data.die_sizes = game.heart.die_sizes.reduce((map, die) => {
            map[die] = game.i18n.format('heart.die_size.d(N)', {N: die.replace(/^d/, '')})
            return map;
        }, {});

        data.skills = game.heart.skills.reduce((map, skill) => {
            map[skill] = game.i18n.localize(`heart.skill.${skill}`)
            return map;
        }, {});

        data.domains = game.heart.domains.reduce((map, domain) => {
            map[domain] = game.i18n.localize(`heart.domain.${domain}`)
            return map;
        }, {});

        data.equipment_types = game.heart.equipment_types.reduce((map, equipment_type) => {
            map[equipment_type] = game.i18n.localize(`heart.equipment.type.${equipment_type}`)
            return map;
        }, {});

        data.children = this.children;
        data.childrenTypes = this.childrenTypes;

        return data;
    }
}