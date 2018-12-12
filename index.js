
const jobs = require('./jobs'),
	races = require('./races'),
	ItemStrings = require('item-strings')

module.exports = function Inspector(mod) {
	let cid = null,
		enabled = true,
		inCombat = false
		
	mod.hook('S_LOGIN', mod.majorPatchVersion < 77 ? 11 : 12, event => {
		cid = event.gameId
		inCombat = false
	})

	mod.hook('S_OTHER_USER_APPLY_PARTY', 1, event => {
		if (!enabled) return
		let name = event.name,
			level = event.level,
			job = event.class,
			gender = event.gender,
			race = event.race
		if (!inCombat) {
			//setTimeout( function inspect() {
					mod.toServer('C_REQUEST_USER_PAPERDOLL_INFO', 1, { name: name })
				//}, 2000)
		}
		console.log('玩家：' + name + ' 申请加入队伍/团队')
	})
	
	mod.hook('S_USER_STATUS', 3, event => { 
		if(event.gameId == (cid)) {
			if(event.status == 1) {
				inCombat = true
			}
			else inCombat = false
		}
	})
	
	mod.hook('S_USER_PAPERDOLL_INFO', 6, event => {
		let name = event.name,
			level = event.level,
			race = Math.floor((event.templateId - 100) / 200 % 50), // 0 Human, 1 High Elf, 2 Aman, 3 Castanic, 4 Popori/Elin, 5 Baraka
			gender = Math.floor(event.templateId / 100 % 2) + 1, // 1 female, 2 male
			job = event.templateId % 100 - 1, // 0 Warrior, 1 Lancer, [...], 12 Valkyrie
			weapon = event.weapon,
			chest = event.body,
			gloves = event.hand,
			boots = event.feet,
			innerwear = event.underwear,
			circlet = event.head,
			itemLevel = event.itemLevel,
			itemLevelInventory = event.itemLevelInventory,
			guild = event.guild != '' ? '公會: ' + event.guild : '公會: 无',
			weaponenchant, chestenchant, glovesenchant, bootsenchant,
			weaponcrystal1, weaponcrystal2, weaponcrystal3, weaponcrystal4,
			chestcrystal1, chestcrystal2, chestcrystal3, chestcrystal4
			
		for(let item of event.items) {
			switch(item.slot) {
				case 1: // weapon
					weaponenchant = item.enchantment
					weaponcrystal1 = item.crystal1 != 0 ? conv(item.crystal1) : 'none'
					weaponcrystal2 = item.crystal2 != 0 ? conv(item.crystal2) : 'none'
					weaponcrystal3 = item.crystal3 != 0 ? conv(item.crystal3) : 'none'
					weaponcrystal4 = item.crystal4 != 0 ? conv(item.crystal4) : 'none'
					break;
				case 3: // chest
					chestenchant = item.enchantment
					chestcrystal1 = item.crystal1 != 0 ? conv(item.crystal1) : 'none'
					chestcrystal2 = item.crystal2 != 0 ? conv(item.crystal2) : 'none'
					chestcrystal3 = item.crystal3 != 0 ? conv(item.crystal3) : 'none'
					chestcrystal4 = item.crystal4 != 0 ? conv(item.crystal4) : 'none'
					break;
				case 4: // gloves
					glovesenchant = item.enchantment
					break;
				case 5: // boots
					bootsenchant = item.enchantment
					break;
			}
		}
		mod.command.message(' [玩家]:'+ name + ' (等級: ' + level +' - 職業: '+ getJob(job) + ' - ' + getGender(gender) + ' ' + getRace(race, gender) + ')')
		mod.command.message('	     ' + guild + ' - 裝等: ' + itemLevel + '(' + itemLevelInventory + ')')
		mod.command.message('	     ' + '武器: ' + conv(weapon) + ' +' + weaponenchant)
		//mod.command.message('            ' + '        ' + weaponcrystal1)
		//mod.command.message('            ' + '        ' + weaponcrystal2)
		//mod.command.message('            ' + '        ' + weaponcrystal3)
		//mod.command.message('            ' + '        ' + weaponcrystal4)
		mod.command.message('	     ' + '上衣: ' + conv(chest) + ' +' + chestenchant)
		//mod.command.message('            ' + '       ' + chestcrystal1)
		//mod.command.message('            ' + '       ' + chestcrystal2)
		//mod.command.message('            ' + '       ' + chestcrystal3)
		//mod.command.message('            ' + '       ' + chestcrystal4)
		mod.command.message('	     ' + '手套: ' + conv(gloves) + ' +' + glovesenchant)
		mod.command.message('	     ' + '鞋子: ' + conv(boots) + ' +' + bootsenchant)
		//mod.command.message('            ' + '內衣: ' + conv(innerwear))
		//mod.command.message('            ' + '頭飾: ' + conv(circlet))
	})
	
	// ######################## //
	// ### Helper Functions ### //
	// ######################## //
	
	function get(obj, ...keys) {
		if(obj === undefined) return

		for(let key of keys)
			if((obj = obj[key]) === undefined)
				return

		return obj
	}
	
	function getJob(job) {
		return get(jobs, job, "name") || "Undefined"
	}
	
	function getRace(race, gender) {
		if((race == 4) && (gender == 1)) return "Elin"
		return get(races, race, "name") || "Undefined"
	}
	
	function getGender(gender) {
		if(gender == 1) return "種族(男)："
		else if(gender == 2) return "種族(女)："
		else return "Undefined"
	}
	
	function conv(s) {
		return ItemStrings(s) || "Undefined";
	}
  
	// ################# //
	// ### Chat Hook ### //
	// ################# //

	mod.command.add('inspect', () => {
		enabled = !enabled
		mod.command.message('[Inspector] ' + (enabled ? '<font color="#56B4E9">enabled</font>' : '<font color="#E69F00">disabled</font>'))
		console.log('[Inspector] ' + (enabled ? 'enabled' : 'disabled'))
	})
}