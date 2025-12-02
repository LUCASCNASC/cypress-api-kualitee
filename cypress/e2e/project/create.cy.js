const PATH_API = '/Project/ProjectCreate';
const validToken = Cypress.env('VALID_TOKEN');

describe('API rest - Project Create - /project/create', () => {
  
  const validBody = {
    token: validToken,
    project_name: 'Novo Projeto Teste',
    project_description: 'Descrição do projeto para testes automatizados.',
    project_type: 'desktop', // desktop, mobile, r-web, web
    project_os: ['Windows', 'Linux'],
    project_devices: ['PC', 'Laptop'],
    project_browser: ['Chrome', 'Firefox']
  };

  function projectCreate(body, options = {}) {
    return cy.request({
      method: 'POST',
      url: `/${PATH_API}`,
      form: true,
      body,
      failOnStatusCode: false,
      ...options,
    });
  }
  
  it('Status Code 200', () => {
    projectCreate(validBody).then(response => {
      expect(response.status).to.eq(200);
      expect(response.body).to.be.an('object');
      expect(response.headers['content-type']).to.include('application/json');
    });
  });

  
  it('Falha sem token', () => {
    const { token, ...body } = validBody;
    projectCreate(body).then(response => {
      expect([400, 401, 403]).to.include(response.status);
    });
  });

  it('Falha com token inválido', () => {
    projectCreate({ ...validBody, token: 'token_invalido' }).then(response => {
      expect([400, 401, 403]).to.include(response.status);
    });
  });

  it('Falha com token expirado', () => {
    projectCreate({ ...validBody, token: 'token_expirado' }).then(response => {
      expect([401, 403]).to.include(response.status);
    });
  });

  it('Falha com token nulo', () => {
    projectCreate({ ...validBody, token: null }).then(response => {
      expect([400, 401, 403]).to.include(response.status);
    });
  });

  // --- Campos obrigatórios ausentes ---
  ['project_name', 'project_description', 'project_type', 'project_os', 'project_devices', 'project_browser'].forEach(field => {
    it(`Falha sem campo obrigatório ${field}`, () => {
      const body = { ...validBody };
      delete body[field];
      projectCreate(body).then(response => {
        expect([400, 422]).to.include(response.status);
      });
    });
  });

  // --- Campos obrigatórios vazios ---
  ['project_name', 'project_description', 'project_type'].forEach(field => {
    it(`Falha com campo obrigatório ${field} vazio`, () => {
      const body = { ...validBody, [field]: '' };
      projectCreate(body).then(response => {
        expect([400, 422]).to.include(response.status);
      });
    });
  });

  // --- project_type inválido ---
  it('Falha com project_type inválido', () => {
    projectCreate({ ...validBody, project_type: 'invalid_type' }).then(response => {
      expect([400, 422]).to.include(response.status);
    });
  });

  // --- Array fields vazios ou tipos errados ---
  ['project_os', 'project_devices', 'project_browser'].forEach(arrayField => {
    it(`Falha com campo ${arrayField} vazio`, () => {
      projectCreate({ ...validBody, [arrayField]: [] }).then(response => {
        expect([400, 422]).to.include(response.status);
      });
    });
    it(`Falha com campo ${arrayField} tipo errado`, () => {
      projectCreate({ ...validBody, [arrayField]: 'string_invalida' }).then(response => {
        expect([400, 422]).to.include(response.status);
      });
    });
  });

  
  it('Ignora campo extra no body', () => {
    projectCreate({ ...validBody, extra: 'foo' }).then(response => {
      expect(response.status).to.eq(200);
    });
  });

  
  ['GET', 'PUT', 'DELETE', 'PATCH'].forEach(method => {
    it(`Falha com método HTTP ${method}`, () => {
      cy.request({
        method,
        url: `/${PATH_API}`,
        form: true,
        body: validBody,
        failOnStatusCode: false,
      }).then(response => {
        expect([405, 404, 400]).to.include(response.status);
      });
    });
  });

  
  it('Falha com Content-Type application/json', () => {
    cy.request({
      method: 'POST',
      url: `/${PATH_API}`,
      body: validBody,
      headers: { 'Content-Type': 'application/json' },
      failOnStatusCode: false
    }).then((response) => {
      expect([400, 415]).to.include(response.status);
    });
  });

  
  it('Resposta não deve vazar stacktrace, SQL, etc.', () => {
    projectCreate({ ...validBody, project_name: "' OR 1=1 --" }).then(response => {
      const body = JSON.stringify(response.body);
      expect(body).not.to.match(/exception|trace|sql|database/i);
    });
  });

  
  it('Headers devem conter CORS e content-type', () => {
    projectCreate(validBody).then(response => {
      expect(response.headers).to.have.property('access-control-allow-origin');
      expect(response.headers['content-type']).to.include('application/json');
    });
  });

  
  it('Falha após múltiplas requisições rápidas (rate limit)', () => {
    const requests = Array(10).fill(0).map(() =>
      projectCreate(validBody)
    );
    cy.wrap(Promise.all(requests)).then((responses) => {
      const rateLimited = responses.some(r => r.status === 429);
      expect(rateLimited).to.be.true;
    });
  });

  
  it('Permite requisições duplicadas rapidamente', () => {
    projectCreate(validBody)
      .then(() => projectCreate(validBody))
      .then((response) => {
        expect([200, 400, 401, 409]).to.include(response.status);
      });
  });

});