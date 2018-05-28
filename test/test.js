const request = require('supertest')
const app = require('../')

describe('App server', () => {
    describe('/createPage',() => {
        it('Should fail when missing params', () => {
            request(app)
                .post('/createPage')
                .set('Accept', 'application/json')
                .expect(500)
                .expect('Content-Type', /json/)
                .end(function(err, res) {
                    if (err) throw err;
                });
        })
    })
})