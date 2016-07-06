import org.junit.Test;


public class TestCatch {
	@Test
	public void tR(){
		System.out.println(e());
	}
    public String e(){
        try {
                double i=1/0;
        } catch (NumberFormatException | NullPointerException e) {
                System.out.println("catch.....");                
                throw new RuntimeException("1111111");                                                
        }finally{
                System.out.println("finally.....");  
                
        }
        return "1";
    }
}
