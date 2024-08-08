import { DataSource } from "typeorm";
import { Product } from "./Product";
import { ProductService } from "./ProductService";
import { MySqlContainer } from "@testcontainers/mysql";

test("create product", async() => {
  const mysqlContainer = await new MySqlContainer().start();

  const dataSource = new DataSource({
    type: "mysql",
    host: "",
    port: 0,
    username: "",
    password: "",
    synchronize: true,
    entities: [Product],
    logging: true
  });

  await dataSource.initialize();

  const productService = new ProductService(dataSource.getRepository(Product));

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