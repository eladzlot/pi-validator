import contextMenu from 'utils/contextMenuComponent';
import messages from 'utils/messagesComponent';
import {createDir, createEmpty, moveFile, copyUrl} from './fileActions';
import {createFromTemplate} from './wizardActions';
import wizardHash from './wizardHash';
export default fileContext;

// download support according to modernizer
let downloadSupport = !window.externalHost && 'download' in document.createElement('a');

let fileContext = (file, study) => {
	let path = file.isDir ? file.path : file.basePath;
	let menu = [
		// {icon:'fa-copy', text:'Duplicate', action: () => messages.alert({header:'Duplicate: ' + file.name, content:'Duplicate has not been implemented yet'})},

		{icon:'fa-folder', text:'New Folder', action: createDir(study, path)},
		{icon:'fa-file', text:'New File', action: createEmpty(study, path)},
		{icon:'fa-file-text', text:'New from template', menu: mapWizardHash(wizardHash)},
		// {icon:'fa-magic', text:'New from wizard', menu: [
			// {text: 'Work in progress...'},
			// {text: 'Work in progress...'},
			// {text: 'Work in progress...'}
		// ]},
		{separator:true},
		{icon:'fa-refresh', text: 'Refresh/Reset', action: refreshFile, disabled: file.content() == file.sourceContent()},
		{icon:'fa-download', text:'Download', action: downloadFile},
		{icon:'fa-link', text: 'Copy URL', action: copyUrl(file)},

		{icon:'fa-close', text:'Delete', action: deleteFile},
		{icon:'fa-exchange', text:'Move/Rename...', action: moveFile(file,study)}
	];

	return contextMenu.open(menu);

	function mapWizardHash(wizardHash){
		return Object.keys(wizardHash).map((text) => {
			let value = wizardHash[text];
			return typeof value === 'string'
				? {text, action: createFromTemplate({study, path, url:value, templateName:text})}
				: {text, menu: mapWizardHash(value)};
		});
	}

	function refreshFile(){
		file.content(file.sourceContent());
		m.redraw();
	}

	function downloadFile(){
		if (downloadSupport){
			let link = document.createElement('a');
			link.href = file.url;
			link.download = file.name;
			link.target = '_blank';
			document.body.appendChild(link);
			link.click();
			document.body.removeChild(link);
		} else {
			let win = window.open(file.url, '_blank');
			win.focus();
		}
	}

	function deleteFile(){
		messages.confirm({
			header:['Delete ',m('small', file.name)],
			content: 'Are you sure you want to delete this file? This action is permanent!'
		})
		.then(ok => {
			if (ok) return study.del(file.id);
		})
		.then(m.redraw)
		.catch( err => {
			err.response.json()
				.then(response => {
					messages.alert({
						header: 'Delete failed:',
						content: response.message
					});
				});
			return err;
		});
	} // end delete file
};

