console.log('Todo funcionando.')

let nav = document.getElementsByTagName('nav');
let botonNav = nav[0].getElementsByTagName('a');

var xhr

const cantidadPaginas = 4
const arrayPaginas = [
	'/index.html',
	'/paginas/soluciones.html',
	'/paginas/nosotros.html',
	'/paginas/contacto.html'
]

const urlAPI = 'https://63496f4aa59874146b200ff2.mockapi.io/api/v1/comments'
const cantidadComentarios = 8

/* -------------- */
/* Carga dinámica */
/* -------------- */

for (let i=0; i<cantidadPaginas; i++) {
	botonNav[i].addEventListener('click', e => {
		e.preventDefault()

		xhr = new XMLHttpRequest()
		xhr.onreadystatechange = adjuntarInfo
		xhr.open("GET", arrayPaginas[i])
		window.history.pushState("object or string", "Title", arrayPaginas[i])
		xhr.send()
	})
}

comprobarRuta()

/* --------- */
/* Funciones */
/* --------- */

function adjuntarInfo() {
	if (xhr.readyState === 4) {
		let res = xhr.responseText

		parser = new DOMParser();
		let pagina = parser.parseFromString(res, "text/html");
		let section = pagina.getElementsByTagName('section')[0].innerHTML;

		document.getElementsByTagName('section')[0].innerHTML = ''
		document.getElementsByTagName('section')[0].innerHTML = section

		comprobarRuta()
	}
}

function comprobarRuta() {
	var ruta = window.location.pathname;

	switch (ruta) {
		case (arrayPaginas[1]):
			obtenerComentariosDesdeAPI()
			break;
		case (arrayPaginas[3]):
			adjuntarValidacion()
			break;
	}
}

function obtenerComentariosDesdeAPI() {
	fetch(urlAPI).then(response => {
		if (response.ok)
			return response.json()
		throw new Error('Hubo un error al obtener datos desde la API: ', response)
	})
	.then((comments) => {
		for (let i=0; i<cantidadComentarios; i++)
			adjuntarComentario(i + 1, comments[i])
	})
}

function adjuntarValidacion() {
	const form = document.querySelector('form')
	const inputs = form.querySelectorAll('input')
	const textarea = form.querySelector('textarea')
	let nombre = ''
	let correo = ''
	let consulta = ''
	const contenedorError = form.querySelector('.mensaje-error')
	let mensaje = ''
	let envioConsulta = false

	// Expresiones regulares ─ nótese que éstas no son cadenas
	const regexNombre = /^[a-zA-ZñÑáéíóúÁÉÍÓÚ]+(\s+[a-zA-ZñÑáéíóúÁÉÍÓÚ]+)*$/
	const regexConsulta = /^[a-zA-ZñÑáéíóúÁÉÍÓÚüÜ0-9!"@#\$%\/\(\)=\'¡?¿,;\.:\-_\+\*€]+(\s+[a-zA-ZñÑáéíóúÁÉÍÓÚüÜ0-9!"@#\$%\/\(\)=\'¡?¿,;\.:\-_\+\*€]+)*$/

	form.addEventListener('submit', e => {
		e.preventDefault()

		mensaje = ''
		nombre = inputs[0].value
		correo = inputs[1].value
		consulta = textarea.value

		if (!nombre || !regexNombre.test(nombre))
			mensaje += '<p style="color: red;">El nombre no se ajusta al patrón solicitado.</p>'

		if (!consulta || !regexConsulta.test(consulta))
			mensaje += '<p style="color: red;">La consulta no se ajusta al patrón solicitado.</p>'
		
		if (mensaje === '') {
			envioConsulta = true
			mensaje = '<p style="color: #5966b4;">¡Consulta enviada con éxito!</p>'
		}
		mostrarNotificacion(contenedorError, mensaje)

		if (envioConsulta)
			window.setTimeout(() => {
				contenedorError.style.display = "none"
				inputs[0].value = ''
				inputs[1].value = ''
				textarea.value = ''
			}, 4500)

		// El envío de información se gestiona aquí abajo
	})
}

function mostrarNotificacion(elem, msj) {
	elem.innerHTML = msj
	elem.style.display = "block"
	window.setTimeout( () => {
		elem.style.opacity = "1";
	}, 50);
}

function adjuntarComentario(n, comentario) {
	const contenedorComentarios = document.querySelector('.contenedor-comentarios')

	// contenedorComentarios.innerHTML += `<p>${n}.\t${comentario}</p>`

	if (contenedorComentarios)
		contenedorComentarios.innerHTML += `
			<div class="comentario">
				<div class="comentario-numero" title="Comentario número ${n}">
					# ${n}
				</div>
				<div class="comentario-header">
					<img src="${comentario.avatar}" alt="Foto de perfil de ${comentario.name}" title="Foto de perfil de ${comentario.name}">
					<div>
						<h3>${comentario.name}</h3>
						<span class="fecha-comentario">${obtenerFecha(comentario.createdAt)}</span>
						<span class="fecha-comentario">${obtenerHora(comentario.createdAt)}</span>
					</div>
				</div>
				<div class="comentario-body">
					<p>${comentario.comment}</p>
				</div>
			</div>
		`
}

function formatearFecha(f) {
	let fecha = f.substr(0,10)	// AAAA-MM-DDTHH:MM:SS.MSSZ
	let hora = f.substr(11,8)
	return fecha + " " + hora
}

function obtenerFecha(f) { return f.substr(0,10) }
function obtenerHora(f) { return f.substr(11,8) }