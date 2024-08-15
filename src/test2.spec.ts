import { DataSource, DataSourceOptions } from "typeorm";
import { Product } from "./Product";
import { ProductService } from "./ProductService";
import { MySqlContainer, StartedMySqlContainer } from "@testcontainers/mysql";

describe("ProductService 2 Tests", () => {
  let mysqlContainer: StartedMySqlContainer;
  let dataSource: DataSource;

  beforeAll(async () => {
    mysqlContainer = await new MySqlContainer("mysql:8.0.30-debian")
      .withCommand(["--default-authentication-plugin=mysql_native_password"])
      .withRootPassword("root")
      .start();
  }, 200000);

  beforeEach(async () => {
    const connOptions: DataSourceOptions = {
      type: "mysql",
      host: mysqlContainer.getHost(),
      port: mysqlContainer.getMappedPort(3306),
      logging: true
    };

    const adminDataSource = new DataSource({
      ...connOptions,
      username: "root",
      password: "root",
      database: "test"
    });

    await adminDataSource.initialize();

    const databaseName = "test_" + Math.random().toString(36).substring(7);

    await adminDataSource.query(`CREATE DATABASE ${databaseName};`);
    await adminDataSource.destroy();

    dataSource = new DataSource({
      type: "mysql",
      host: mysqlContainer.getHost(),
      port: mysqlContainer.getMappedPort(3306),
      username: "root",
      password: "root",
      database: databaseName,
      synchronize: true,
      entities: [Product],
      logging: true
    });

    await dataSource.initialize();
  });

  afterEach(async () => {
    await dataSource?.destroy();
  });

  afterAll(async () => {
    await mysqlContainer?.stop();
  });

  test.each([
    {
      name: "product",
      price: 100,
    },
    {
      name: "product",
      price: 100,
    },
    {
      name: "product",
      price: 100,
    },
    {
      name: "product",
      price: 100,
    },
  ])("create product", async (productData) => {
    const productService = new ProductService(
      dataSource.getRepository(Product)
    );

    const product = await productService.createProduct(productData);

    expect(product).toEqual({
      id: expect.any(Number),
      name: "product",
      price: 100
    });
  });
});
