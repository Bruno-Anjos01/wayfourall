import { erroHttp, texto, validarId } from '../../utils/validation.js';

const campos = {
  nome: 'nome', descricao: 'descricao', categoriaId: 'categoria_id', telefone: 'telefone',
  site: 'site', cep: 'cep', logradouro: 'logradouro', numero: 'numero', complemento: 'complemento',
  bairro: 'bairro', cidade: 'cidade', estado: 'estado', latitude: 'latitude', longitude: 'longitude',
};
const limites = { nome: 180, descricao: 10000, telefone: 30, site: 255, cep: 10,
  logradouro: 180, numero: 20, complemento: 100, bairro: 100, cidade: 100, estado: 2 };

export function validarEstabelecimento(dados, parcial = false, admin = false) {
  if (!dados || typeof dados !== 'object' || Array.isArray(dados)) throw erroHttp(400, 'Dados inválidos');
  const permitidos = [...Object.keys(campos), 'recursos', ...(admin ? ['status', 'verificado'] : [])];
  if (Object.keys(dados).some((campo) => !permitidos.includes(campo))) throw erroHttp(400, 'Campo não permitido');
  const resultado = {};
  for (const [campo, limite] of Object.entries(limites)) {
    const obrigatorio = ['nome', 'logradouro', 'cidade', 'estado'].includes(campo);
    if (campo in dados || (!parcial && obrigatorio)) resultado[campo] = texto(dados[campo], campo, limite, obrigatorio);
  }
  if ('estado' in resultado) {
    resultado.estado = resultado.estado.toUpperCase();
    if (!'AC AL AP AM BA CE DF ES GO MA MT MS MG PA PB PR PE PI RJ RN RS RO RR SC SP SE TO'.split(' ').includes(resultado.estado)) throw erroHttp(400, 'Estado inválido');
  }
  if (resultado.site) {
    let url;
    try { url = new URL(resultado.site); } catch { throw erroHttp(400, 'Site inválido'); }
    if (!['http:', 'https:'].includes(url.protocol)) throw erroHttp(400, 'Site deve usar HTTP ou HTTPS');
  }
  if ('categoriaId' in dados) resultado.categoriaId = dados.categoriaId == null ? null : validarId(dados.categoriaId);
  for (const [campo, limite] of [['latitude', 90], ['longitude', 180]]) {
    if (!(campo in dados)) continue;
    const valor = dados[campo];
    if (valor !== null && (typeof valor !== 'number' || !Number.isFinite(valor) || Math.abs(valor) > limite)) throw erroHttp(400, `${campo} inválida`);
    resultado[campo] = valor;
  }
  if ('recursos' in dados) {
    if (!Array.isArray(dados.recursos) || dados.recursos.length > 100) throw erroHttp(400, 'Recursos inválidos');
    resultado.recursos = [...new Set(dados.recursos.map(validarId))];
  }
  if (admin && 'status' in dados) {
    if (!['pendente', 'aprovado', 'rejeitado'].includes(dados.status)) throw erroHttp(400, 'Status inválido');
    resultado.status = dados.status;
  }
  if (admin && 'verificado' in dados) {
    if (typeof dados.verificado !== 'boolean') throw erroHttp(400, 'Verificado deve ser booleano');
    resultado.verificado = dados.verificado;
  }
  if (!Object.keys(resultado).length) throw erroHttp(400, 'Informe ao menos um campo');
  return resultado;
}

// Recebe a conexão da transação para que solicitação e estabelecimento sejam atômicos.
export async function salvarEstabelecimento(client, dados, id = null) {
  const mapa = { ...campos, status: 'status', verificado: 'verificado' };
  const entradas = Object.entries(dados).filter(([campo]) => campo in mapa);
  const valores = entradas.map(([, valor]) => valor);
  let resultado;
  if (id !== null) {
    const atribuicoes = entradas.map(([campo], i) => `${mapa[campo]} = $${i + 1}`);
    atribuicoes.push('atualizado_em = CURRENT_TIMESTAMP');
    valores.push(id);
    resultado = await client.query(`UPDATE estabelecimentos SET ${atribuicoes.join(', ')} WHERE id = $${valores.length} RETURNING *`, valores);
  } else {
    resultado = await client.query(`INSERT INTO estabelecimentos (${entradas.map(([campo]) => mapa[campo]).join(', ')}) VALUES (${valores.map((_, i) => `$${i + 1}`).join(', ')}) RETURNING *`, valores);
  }
  if (!resultado.rows.length) throw erroHttp(404, 'Estabelecimento não encontrado');
  const estabelecimento = resultado.rows[0];
  if (dados.recursos !== undefined) {
    await client.query('DELETE FROM estabelecimento_recursos WHERE estabelecimento_id = $1', [estabelecimento.id]);
    for (const recurso of dados.recursos) {
      await client.query('INSERT INTO estabelecimento_recursos (estabelecimento_id, recurso_id) VALUES ($1, $2)', [estabelecimento.id, recurso]);
    }
  }
  return estabelecimento;
}
