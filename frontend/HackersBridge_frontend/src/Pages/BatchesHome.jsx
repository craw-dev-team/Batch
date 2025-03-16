import Batches from "../Components/dashboard/Batches/Batches";
import Table1 from "../Components/dashboard/Batches/Table";



const BatchesHome = () => {
    return (
        <>
        <div className={'w-full h-full overflow-hidden pt-1 darkmode'}>
            <Batches />
            {/* <Table1 /> */}
        </div>
        </>
    )
}

export default BatchesHome;