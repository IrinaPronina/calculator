import Image from "next/image";
import styles from "./page.module.css";
import Calculator from "@/components/calculator/calculator";

const Home = ()=> {
  return (
    <div>
      <section><h2 className="invisible">Расчет сметы на бетонные полы</h2></section>
      <Image
          src="/bannerBetonCalc.jpg"
          alt="Смета за минуту"
          className={styles.banner}
          width={2163}
          height={916}
          priority
        />
        <section className={styles.calculator}>
        <div className={`${styles.wrapper} ${'container'}`}>
          <h2 className={styles.title}>
            Расчет стоимости бетонных полов(цены обновлены 20.06.2025г.)
          </h2>
          <Calculator />
        </div>
      </section>
    </div>
  );
}
export default Home;