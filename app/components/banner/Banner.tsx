import bannerImg from '../../../public/bannerBetonCalc.jpg';
import Image from 'next/image';

const Banner = () => {
    return (
        <section>
            <h2 className='invisible'>Расчет сметы на бетонные полы</h2>
            <Image
                src={bannerImg}
                alt='Смета за минуту'
                width={2163}
                height={916}
            />
        </section>
    );
};

export default Banner;
