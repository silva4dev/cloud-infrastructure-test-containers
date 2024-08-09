import { DataSource } from "typeorm";
import { Product } from "./Product";
import { ProductService } from "./ProductService";
import { MySqlContainer, StartedMySqlContainer } from "@testcontainers/mysql";

describe("ProductService Tests", () => {
  let mysqlContainer: StartedMySqlContainer;
  let dataSource: DataSource;

  beforeEach(async () => {
    mysqlContainer = await new MySqlContainer("mysql:8.0.30-debian")
      .withCommand(["--default-authentication-plugin=mysql_native_password"])
      .start();

    dataSource = new DataSource({
      type: "mysql",
      host: mysqlContainer.getHost(),
      port: mysqlContainer.getMappedPort(3306),
      username: "test",
      password: "test",
      database: "test",
      synchronize: true,
      entities: [Product],
      logging: true
    });

    await dataSource.initialize();
  }, 200000);

  afterEach(async () => {
    await dataSource?.destroy();
    await mysqlContainer?.stop();
  });

  test("create product", async () => {
    const productService = new ProductService(
      dataSource.getRepository(Product)
    );

    const product = await productService.createProduct({
      name: "product",
      price: 100
    });

    expect(product).toEqual({
      id: expect.any(Number),
      name: "product",
      price: 100
    });
  });

  test("delete product", async () => {
    const productService = new ProductService(
      dataSource.getRepository(Product)
    );

    const product = await productService.createProduct({
      name: "product",
      price: 100
    });

    await productService.deleteProduct(product.id);

    const deletedProduct = await dataSource.getRepository(Product).findOne({
      where: {
        id: product.id
      }
    });

    expect(deletedProduct).toBeNull();
  });
});
