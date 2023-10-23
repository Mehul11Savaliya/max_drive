const chai = require('chai');
const chaiHttp = require('chai-http');
const app = require('../app'); // Replace with the actual path to your Express app
const mocha = require("mocha");

chai.use(chaiHttp);

describe('API Endpoint Tests', () => {
  it('should return a 200 status code for GET /', (done) => {
    chai.request(app)
      .get('/')
      .end((err, res) => {
        chai.expect(res).to.have.status(200);
        done();
      });
  });
  
  it('should return the correct response for GET /signup', (done) => {
    chai.request(app)
      .get('/signup')
      .end((err, res) => {
        chai.expect(res).to.have.status(200);
        done();
      });
  });
});

describe("user endpoint test ",()=>{
    it("should return a index.ejs with status 200",(done)=>{
        chai.request(app)
        .get("/user/")
        .end((err,res)=>{
            chai.expect(res).to.have.status(400);
            done();
        })
    })
})
